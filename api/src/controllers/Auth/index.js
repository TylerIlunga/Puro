/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Auth
 *  Purpose       :  Module for the Auth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   middleware()
 *                   signup()
 *                   verifyAccount()
 *                   login()
 *                   verifyResetToken()
 *                   resendEmail()
 *                   handleTFA()
 *                   forgotPassword()
 *                   resetPassword()
 *                   deleteAccount()
 *
 *  Notes         :  7
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const db = require('../../db');
const Sequelize = db.getClient();
const Op = Sequelize.Op;
const User = db.User;
const {
  web_base,
  API_KEY,
  jwt: { J_SECRET },
} = require('../../config');
const { genid, genPassword } = require('../../db/config');
const { sendEmail } = require('../../email');
const getWelcomeHtml = require('../../email/static/welcome');
const getForgotPasswordHtml = require('../../email/static/forgot');

let tempUserObject = {};

// NOTE: Get rid of try, catch
// NOTE: Change all to "Missing fields" to not give away information.

module.exports = {
  /**
   * middleware
   * Handles verification checks for authenticated users
   */
  async middleware(req, res, next) {
    console.log('GENERIC MIDDLEWARE middleware()');
    // headers: { authorization: BEARER {JWT}, API_KEY: OHM {KEY} }
    if (
      !(
        req.headers.authorization &&
        req.headers.authorization.indexOf('BEARER') > -1
      )
    ) {
      return res.json({ error: 'Missing JWT', success: false });
    }
    console.log('headers', req.headers);
    if (!(req.headers.api_key && req.headers.api_key.indexOf('OHM') > -1)) {
      return res.json({ error: 'Missing key', success: false });
    }
    if (req.headers.api_key.split(' ')[1] !== API_KEY) {
      return res.json({ error: 'Invalid key', success: false });
    }

    let token = req.headers.authorization.split(' ')[1];
    console.log('token', token);
    try {
      let decoded = await jwt.verify(token, J_SECRET);
      console.log('DECODED token::::', decoded);
      // is token expired
      if (Date.now() > decoded.exp * 1000) {
        return res.json({ success: false, error: 'Session expired.' });
      }

      return next();
    } catch (error) {
      console.log('middleware() error', error);
      return res.json({ error: 'Invalid session.', success: false });
    }
  },
  /**
   * signup[POST]
   * Creates an account for a user(must verify via email)
   */
  async signup(req, res) {
    if (!(req.body.email || req.body.password || req.body.recaptchaResponse)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    let { email, password, recaptchaResponse } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) return res.json({ error: 'User exists.', success: false });

    console.log('oldPassword', password);
    password = await genPassword(password);
    console.log('newPassword', password);

    const trial_expires = new Date();
    // seven days ahead
    trial_expires.setDate(trial_expires.getDate() + 7);
    // at 8 AM
    trial_expires.setHours(8);

    User.create({
      password,
      subscription: 'free',
      email: email.trim(),
      trial_expires: new Date().setTime(Date.parse(trial_expires)),
      business: req.body.business ? req.body.business : null,
      activation_token: genid(),
      type: 'user',
    })
      .then(user => {
        //change 1st argument to support@puro.com
        // https://aws.amazon.com/ses/pricing/
        sendEmail(
          'support@puro.com',
          user.email,
          'Activate your account!',
          getWelcomeHtml(user),
        )
          .then(success => {
            console.log('email sent!');
            return res.json({ success: true, user });
          })
          .catch(error => {
            console.log(`signup error: ${error}`);
            return res.json({
              error:
                'Error sending activation email, please contact support@puro.com',
              success: false,
            });
          });
      })
      .catch(error => {
        console.log('User.create() error', error);
        return res.json({ error: 'Error saving user.', success: false });
      });
  },
  /*
   * login [POST]
   * Logs a user in and checks for Two Factor Authentication (TFA)
   */
  async login(req, res) {
    if (!(req.body.email || req.body.password) && !req.body.recaptchaResponse) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const { email, password } = req.body;
    const user = await User.findOne({
      attributes: [
        'id',
        'active',
        'email',
        'business',
        'password',
        'subscription',
        'two_factor_enabled',
        'two_factor_secret',
      ],
      where: { email },
    });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }

    if (!user.active) {
      return res.json({ error: 'Activate your account!', success: false });
    }

    // TODO: check if free trial expired, if so, prompt then with payment plans.
    // However, should still have credit card on file?
    let trialExpired = false;
    // if(Date.now() > user.trial_expires * 1000) {
    //   return res.json({success: false, error: 'Session expired.'});
    // }

    bcrypt.compare(password, user.password, async (error, isMatch) => {
      if (error) {
        console.log('bcrypt.compare() error', error);
        return res.json({ error, success: false });
      }
      if (!isMatch) {
        return res.json({ error: 'Invalid Password!', success: false });
      }
      user.dataValues.password = null;
      delete user.dataValues.password; // NOTE: doesn't work
      console.log('user.dataValues', user.dataValues);

      if (user.two_factor_enabled) {
        console.log('USER HAS TFA ENABLED');
        tempUserObject = user.dataValues;
        console.log('tempUserObject:', tempUserObject);
        return res.json({ tfaEnabled: true, success: true, error: false });
      }

      // req.session.user = user.dataValues;
      req.session.save(err => {
        if (err) {
          console.log('req.session.save() err', err);
          return res.json({ error: 'Error creating session.', success: false });
        }
        user.password = null;
        delete user.password;
        let token = jwt.sign({ data: user }, J_SECRET, { expiresIn: '1d' });
        console.log('creating cookie for token: ', token);
        // res.signedCookie("un")
        // 1000 * 60 * 15 = 15 mins
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.cookie('user_token', token, {
          maxAge: 1000 * 60 * 15,
          signed: true,
        });
        console.log('req.session', req.session);
        //NOTE: do not return or store password in token
        return res.json({
          user,
          token,
          trialExpired,
          success: true,
          tfaEnabled: false,
        });
      });
    });
  },
  /**
   * handleTFA[GET]
   * Handles Two Factor Authentication for user attempting
   * to log in.
   */
  async handleTFA(req, res) {
    // req.query.rr = recaptcha
    if (!(req.query && req.query.token && req.query.rr)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    console.log('tempUserObject:', tempUserObject);
    const isValidToken = speakeasy.totp.verify({
      secret: tempUserObject.two_factor_secret,
      encoding: 'ascii',
      token: req.query.token,
    });
    console.log('isValidToken', isValidToken);
    if (!isValidToken) {
      return res.json({ error: 'Invalid token.', success: false });
    }
    // TODO: check if free trial expired, if so, prompt then with payment plans.
    // However, should still have credit card on file?
    let trialExpired = false;
    // if(Date.now() > user.trial_expires * 1000) {
    //   return res.json({success: false, error: 'Session expired.'});
    // }
    req.session.save(err => {
      if (err) {
        console.log('req.session.save() err', err);
        return res.json({ error: 'Error creating session.', success: false });
      }
      tempUserObject.password = null;
      delete tempUserObject.password;
      let token = jwt.sign({ data: tempUserObject }, J_SECRET, {
        expiresIn: '1d',
      });
      console.log('creating cookie for token: ', token);
      // res.signedCookie("un")
      // 1000 * 60 * 15 = 15 mins
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.cookie('user_token', token, {
        maxAge: 1000 * 60 * 15,
        signed: true,
      });
      console.log('req.session', req.session);
      //NOTE: do not return or store password in token
      res.json({ user: tempUserObject, token, trialExpired, success: true });
      tempUserObject = null;
    });
  },
  /**
   * verifyAccount[GET]
   * Verifies and activates user's account via click on
   * sent out email link.
   */
  async verifyAccount(req, res) {
    console.log('req.query', req.query);
    if (!(req.query && req.query.token && req.query.email)) {
      return res.json({ error: 'Missing token', success: true });
    }

    const { token, email } = req.query;
    const user = await User.findOne({
      where: {
        [Op.and]: [{ activation_token: token }, { email: email }],
      },
    });
    if (!user) {
      return res.json({ error: 'Invalid email or token!', success: true });
    }
    user
      .update({ active: true, activation_token: null })
      .then(result => {
        return res.redirect(
          `${web_base}/login?msg=${'Your acccount has been activated'}`,
        );
      })
      .catch(error => {
        return res.json({
          error: 'Error updating account, please contact support@puro.com',
          success: false,
        });
      });
  },

  /**
   * forgotPassword[POST]
   * Sends password reset link to user's stored email.
   */
  async forgotPassword(req, res) {
    if (!req.body.email) {
      return res.json({ error: 'Missing email.', success: false });
    }
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({ error: 'Account does not exist!', success: false });
      }
      console.log('user', user);

      // if (!user.active) {
      //   return res.json({ error: "Activate your account!", success: false });
      // }

      const expireDate = new Date();
      // one day ahead
      expireDate.setDate(expireDate.getDate() + 1);
      // at 8 AM
      expireDate.setHours(8);
      const passwordResetToken = `${genid()}`;
      user
        .update({
          password_reset_token: passwordResetToken,
          password_reset_expires: new Date().setTime(Date.parse(expireDate)),
        })
        .then(result => {
          // https://aws.amazon.com/ses/pricing/
          sendEmail(
            'support@puro.com',
            user.email,
            'Reset your password!',
            getForgotPasswordHtml({ passwordResetToken, email: user.email }),
          )
            .then(success => {
              console.log('email sent!');
              return res.json({
                success: 'An email has been sent with instructions!',
                error: null,
              });
            })
            .catch(error => {
              console.log(`signup error: ${error}`);
              return res.json({
                error:
                  'Error sending reset email, please contact support@puro.com',
                success: false,
              });
            });
        })
        .catch(error => {
          console.log('user.update() error', error);
          return res.json({
            error: 'Error updating account, please contact support@puro.com',
            success: false,
          });
        });
    } catch (error) {
      console.log('forgot password error: ', error);
      return res.json({ error, success: false });
    }
  },
  /**
   * verifyResetToken[GET]
   * Verfies the account reset token we set and send out
   * to user's via email when they need to reset their
   * account. Redirects user back to password reset view.
   */
  async verifyResetToken(req, res) {
    if (!(req.query && req.query.token && req.query.email)) {
      return res.send('Missing email or token.');
    }
    const { token, email } = req.query;
    const user = await User.findOne({
      where: {
        [Op.and]: [{ password_reset_token: token }, { email: email }],
      },
    });
    if (!user) {
      return res.send('Invalid email or token!');
    }
    // TODO: handle if is token expired
    // if(Date.now() > user.password_reset_expires * 1000) {
    //   return res.json({ error: 'Token expired.', success: false });
    // }
    // return res.json({ success: true, error: null });
    return res.redirect(`${web_base}/reset?&email=${email}&token=${token}`);
  },
  /**
   * resetPassword[POST]
   * Resets user password.
   */
  async resetPassword(req, res) {
    // NOTE: Handle confirmPassword value on FE && old password equaling newPassword.
    if (
      !(req.body && req.body.email && req.body.newPassword && req.body.token)
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }

    try {
      const { email, newPassword, token } = req.body;
      console.log(email, newPassword, token);
      const currentUser = await User.findOne({
        where: { email: email, password_reset_token: token },
      });
      console.log(`currentUser: ${JSON.stringify(currentUser, null, 2)}`);
      if (!currentUser) {
        return res.json({ error: 'Invalid email or token!' });
      }
      // TODO: handle if is token expired
      // if(Date.now() > currentUser.password_reset_expires * 1000) {
      //   return res.json({ error: 'Token expired.', success: false });
      // }

      let storedPassword = await genPassword(newPassword);
      console.log(`storedPassword:\n${storedPassword}`);

      bcrypt.compare(
        newPassword,
        currentUser.password,
        async (error, isMatch) => {
          if (error) {
            return res.json({ error, success: false });
          }
          if (isMatch) {
            return res.json({
              error: 'This password is on file!',
              success: false,
            });
          }

          currentUser
            .update({
              password: storedPassword,
              password_reset_expires: null,
              password_reset_token: null,
            })
            .then(result => {
              return res.json({ success: true, error: null });
            })
            .catch(error => {
              console.log('currentUser.update() error', error);
              return res.json({
                error:
                  'Error updating account, please contact support@puro.com',
                success: false,
              });
            });
        },
      );
    } catch (error) {
      console.log(`reset password query error: ${error}`);
      res.json({ error, success: false });
    }
  },
  /**
   * logout[GET]
   * Logs user out.
   */
  logout(req, res) {
    console.log('req.session', req.session);
    if (!req.session) {
      return res.json({ session: false });
    }
    req.session.destroy();
    res.clearCookie('p_sid');
    res.clearCookie('user_token');
    console.log('session destroyed!');
    console.log(req.session);
    res.json({ success: true });
  },
  /**
   * deleteAccount[DELETE]
   * Deletes user's account information.
   */
  async deleteAccount(req, res) {
    if (!(req.query && req.query.id && req.query.email && req.body.password)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const { id, email } = req.query;
    const currentUser = await User.findOne({
      where: { id: id, email: email },
    });
    console.log(`currentUser: ${JSON.stringify(currentUser, null, 2)}`);
    if (!currentUser)
      return res.json({ error: 'Invalid email or id!', success: false });

    const { password } = req.body;
    bcrypt.compare(password, currentUser.password, (error, isMatch) => {
      if (error) {
        return res.json({ error, success: false });
      }
      if (!isMatch) {
        return res.json({ error: 'Old Password is invalid!', success: false });
      }

      currentUser
        .destroy()
        .then(result => {
          req.session.destroy();
          res.clearCookie('user_token');
          console.log('session destroyed!');
          console.log('req.session:::', req.session);

          return res.json({ success: true, error: null });
        })
        .catch(error => {
          console.log('currentUser.destroy() error', error);
          return res.json({
            error: 'Error deleting account, please contact support@puro.com',
            success: false,
          });
        });
    });
  },
  /**
   * resendEmail[GET]
   * Resends activation email to user's who created an account
   * but did not verify and activate.
   */
  async resendEmail(req, res) {
    if (!(req.query && req.query.email)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const user = await User.findOne({
      attributes: ['activation_token', 'email'],
      where: { email: req.query.email },
    });
    console.log(`user: ${JSON.stringify(user, null, 2)}`);
    if (!user || !user.activation_token)
      return res.json({ error: 'Account does not exist!', success: false });
    // https://aws.amazon.com/ses/pricing/
    sendEmail(
      'support@puro.com',
      user.email,
      'Activate your account!',
      getWelcomeHtml(user),
    )
      .then(success => {
        console.log('email sent!');
        return res.json({ success: true, error: false });
      })
      .catch(error => {
        console.log(`signup error: ${error}`);
        return res.json({
          error:
            'Error sending activation email, please contact support@puro.com',
          success: false,
        });
      });
  },
};
