/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Auth
 *  Purpose       :  Module for the Auth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
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
  jwt: { J_SECRET },
} = require('../../config');
const { genid, genPassword } = require('../../db/config');
const { sendEmail } = require('../../email');
const getWelcomeHtml = require('../../email/static/welcome');
const getForgotPasswordHtml = require('../../email/static/forgot');

let tempTFAUser = {};

module.exports = {
  /**
   * Creates an account for a user(must verify via email)
   * @param {Object} req
   * @param {Object} res
   */
  async signup(req, res) {
    try {
      if (!req.body.email && !req.body.password) {
        return res.json({ error: 'Missing fields.', success: false });
      }

      let { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (user) {
        return res.json({ error: 'User exists.', success: false });
      }

      // seven days ahead
      const trial_expires = new Date();
      trial_expires.setDate(trial_expires.getDate() + 7);
      trial_expires.setHours(8);

      password = await genPassword(password);

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
          sendEmail(
            'support@puro.com',
            user.email,
            'Activate your account!',
            getWelcomeHtml(user),
          )
            .then(_ => {
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
    } catch (error) {
      console.log('signup() error', error);
      res.json({
        error: 'Error signing up user, please contact support@puro.com',
        success: false,
      });
    }
  },
  /**
   * Logs a user in and checks for Two Factor Authentication (TFA)
   * @param {Object} req
   * @param {Object} res
   */
  async login(req, res) {
    if (!req.body.email && !req.body.password) {
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

    // NOTE: If this was not a side project:
    // If free trial expired, prompt current user with payment plans post login.
    let trialExpired = false;
    if (user.trial_expires && Date.now() >= user.trial_expires * 1000) {
      return res.json({ success: false, error: 'Trial expired.' });
    }

    bcrypt.compare(password, user.password, async (error, isMatch) => {
      if (error) {
        console.log('bcrypt.compare() error', error);
        return res.json({ error, success: false });
      }
      if (!isMatch) {
        return res.json({ error: 'Invalid Password!', success: false });
      }

      user.dataValues.password = null;
      delete user.dataValues.password;

      if (user.two_factor_enabled) {
        tempTFAUser = user.dataValues;
        return res.json({ tfaEnabled: true, success: true, error: false });
      }

      req.session.save(err => {
        if (err) {
          console.log('req.session.save() err', err);
          return res.json({ error: 'Error creating session.', success: false });
        }

        user.password = null;
        delete user.password;

        res.setHeader('Access-Control-Allow-Credentials', true);

        const token = jwt.sign({ data: user }, J_SECRET, { expiresIn: '1d' });
        res.cookie('user_token', token, {
          // 1000 * 60 * 15 = 15 mins
          maxAge: 1000 * 60 * 15,
          signed: true,
        });

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
   * Handles Two Factor Authentication for user attempting
   * to log in.
   * @param {Object} req
   * @param {Object} res
   */
  async handleTFA(req, res) {
    // req.query.rr = recaptcha
    if (!(req.query && req.query.token && req.query.rr)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    const isValidToken = speakeasy.totp.verify({
      secret: tempTFAUser.two_factor_secret,
      encoding: 'ascii',
      token: req.query.token,
    });
    if (!isValidToken) {
      return res.json({ error: 'Invalid token.', success: false });
    }

    let trialExpired = false;
    if (user.trial_expires && Date.now() >= user.trial_expires * 1000) {
      return res.json({ success: false, error: 'Trial expired.' });
    }

    req.session.save(err => {
      if (err) {
        console.log('req.session.save() err', err);
        return res.json({ error: 'Error creating session.', success: false });
      }

      tempTFAUser.password = null;
      delete tempTFAUser.password;

      res.setHeader('Access-Control-Allow-Credentials', true);

      const token = jwt.sign({ data: tempTFAUser }, J_SECRET, {
        expiresIn: '1d',
      });
      res.cookie('user_token', token, {
        // 1000 * 60 * 15 = 15 mins
        maxAge: 1000 * 60 * 15,
        signed: true,
      });

      res.json({ user: tempTFAUser, token, trialExpired, success: true });
      tempTFAUser = null;
    });
  },
  /**
   * Verifies and activates user's account via click on
   * sent out email link.
   * @param {Object} req
   * @param {Object} res
   */
  async verifyAccount(req, res) {
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
      .then(_ => {
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
   * Sends password reset link to user's stored email.
   * @param {Object} req
   * @param {Object} res
   */
  async forgotPassword(req, res) {
    try {
      if (!req.body.email) {
        return res.json({ error: 'Missing email.', success: false });
      }

      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({ error: 'Account does not exist!', success: false });
      }

      const passwordResetToken = `${genid()}`;
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 1);
      expireDate.setHours(8);

      user
        .update({
          password_reset_token: passwordResetToken,
          password_reset_expires: new Date().setTime(Date.parse(expireDate)),
        })
        .then(_ => {
          sendEmail(
            'support@puro.com',
            user.email,
            'Reset your password!',
            getForgotPasswordHtml({ passwordResetToken, email: user.email }),
          )
            .then(_ => {
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
      return res.json({
        error:
          'Error occuring during event "Forgot Password", please contact support@puro.com',
        success: false,
      });
    }
  },
  /**
   * Verfies the account reset token we set and send out
   * to user's via email when they need to reset their
   * account. Redirects user back to password reset view.
   * @param {Object} req
   * @param {Object} res
   */
  async verifyResetToken(req, res) {
    try {
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
      if (user.trial_expires && Date.now() >= user.trial_expires * 1000) {
        return res.json({ success: false, error: 'Trial expired.' });
      }

      res.redirect(`${web_base}/reset?&email=${email}&token=${token}`);
    } catch (error) {
      console.log('.verifyResetToken() error:', error);
      res.json({
        error: 'Could not verify reset token, please contact supprt@puro.com',
        success: false,
      });
    }
  },
  /**
   * Resets user password.
   * @param {Object} req
   * @param {Object} res
   */
  async resetPassword(req, res) {
    try {
      if (
        !(req.body && req.body.email && req.body.newPassword && req.body.token)
      ) {
        return res.json({ error: 'Missing fields', success: false });
      }

      const { email, newPassword, token } = req.body;
      const currentUser = await User.findOne({
        where: { email: email, password_reset_token: token },
      });
      if (!currentUser) {
        return res.json({ error: 'Invalid email or token!' });
      }
      if (
        currentUser.trial_expires &&
        Date.now() >= currentUser.trial_expires * 1000
      ) {
        return res.json({ success: false, error: 'Trial expired.' });
      }

      const storedPassword = await genPassword(newPassword);
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
            .then(_ => {
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
      console.log('.resetPassword() error', error);
      res.json({
        error: 'Could not reset password, please contact suppoort@puro.com',
        success: false,
      });
    }
  },
  /**
   * Logs user out.
   * @param {Object} req
   * @param {Object} res
   */
  logout(req, res) {
    if (!req.session) {
      return res.json({ session: false });
    }

    req.session.destroy();
    res.clearCookie('p_sid');
    res.clearCookie('user_token');

    console.log('Session has been destroyed.');

    res.json({ success: true });
  },
  /**
   * Deletes user's account information.
   * @param {Object} req
   * @param {Object} res
   */
  async deleteAccount(req, res) {
    try {
      if (
        !(req.query && req.query.id && req.query.email && req.body.password)
      ) {
        return res.json({ error: 'Missing fields.', success: false });
      }

      const { id, email } = req.query;
      const currentUser = await User.findOne({
        where: { id: id, email: email },
      });
      if (!currentUser) {
        return res.json({ error: 'Invalid email or id!', success: false });
      }

      const { password } = req.body;
      bcrypt.compare(password, currentUser.password, (error, isMatch) => {
        if (error) {
          return res.json({ error, success: false });
        }
        if (!isMatch) {
          return res.json({
            error: 'Old Password is invalid!',
            success: false,
          });
        }

        currentUser
          .destroy()
          .then(_ => {
            req.session.destroy();
            res.clearCookie('user_token');

            console.log('Session has been destroyed.');

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
    } catch (error) {
      console.log('.deleteAccount() error:', error);
      res.json({
        error: 'Could not delete account, please contact suppoort@puro.com',
        success: false,
      });
    }
  },
  /**
   * Resends activation email to user's who created an account
   * but did not verify and activate.
   * @param {Object} req
   * @param {Object} res
   */
  async resendEmail(req, res) {
    try {
      if (!(req.query && req.query.email)) {
        return res.json({ error: 'Missing fields.', success: false });
      }

      const user = await User.findOne({
        attributes: ['activation_token', 'email'],
        where: { email: req.query.email },
      });
      if (!user || !user.activation_token) {
        return res.json({ error: 'Account does not exist!', success: false });
      }

      sendEmail(
        'support@puro.com',
        user.email,
        'Activate your account!',
        getWelcomeHtml(user),
      )
        .then(_ => {
          console.log('email sent!');
          return res.json({ success: true, error: false });
        })
        .catch(error => {
          console.log('signup error:', error);
          return res.json({
            error:
              'Error sending activation email, please contact support@puro.com',
            success: false,
          });
        });
    } catch (error) {
      console.log(`.resendEmail() error:`, error);
      res.json({
        error: 'Could not resend email, please contact suppoort@puro.com',
        success: false,
      });
    }
  },
};
