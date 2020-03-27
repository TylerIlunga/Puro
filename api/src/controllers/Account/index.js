/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Account
 *  Purpose       :  Module for the Account service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for Accounts.
 *                   Includes the following:
 *                   getDataToUpdate()
 *                   retrieve()
 *                   verify()
 *                   update()
 *                   reset()
 *
 *  Notes         :  None
 *  Warnings      :  None
 *  Exceptions    :  NumberFormetException when arguments are not numbers
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const { genid, genPassword } = require('../../db/config');
const { sendEmail } = require('../../email');
const getVerifyChangeEmail = require('../../email/static/verify');
const {
  web_base,
  jwt: { J_SECRET },
} = require('../../config');
const Campaign = db.Campaign;
const Entry = db.Entry;
const Snapshot = db.Snapshot;
const User = db.User;

/**
 * Organizes the request's query data for
 * updating an User's account.
 * @param {Object} data
 * @return {Object}
 */
const getDataToUpdate = data => {
  if (data.business && data.email) {
    return { business: data.business, email: data.email };
  }
  if (data.business) {
    return { business: data.business };
  }
  if (data.email) {
    return { email: data.email };
  }
  return null;
};

const aggregateTotals = campaigns => {
  return new Promise((resolve, reject) => {
    let clicks = 0;
    let entriesLength = 0;
    let promises = campaigns.map(async campaign => {
      return Entry.findAll({
        where: { campaign_id: campaign.dataValues.id },
      })
        .then(entries => {
          if (entries) {
            entriesLength += entries.length;
            clicks += entries.reduce((sum, entry) => {
              return (sum += entry.dataValues.clicks);
            }, 0);
          }
        })
        .catch(error => reject({ error }));
    });
    Promise.all(promises)
      .then(_ => {
        resolve({ clicks, entries: entriesLength, error: null });
      })
      .catch(error => reject(error));
  });
};

module.exports = {
  /**
   * Retrieve's the currernt user's session data [GET]
   * @param {Object} req
   * @param {Object} res
   * @return {Object}
   */
  async retrieve(req, res) {
    if (!(req.query && req.query.token)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    jwt.verify(req.query.token, J_SECRET, (error, decoded) => {
      if (error) {
        console.log('Error verifying token!');
        return res.json({ error: 'Error verify token!', success: false });
      }
      // is token expired
      if (Date.now() > decoded.exp * 1000) {
        return res.json({ success: false, error: 'Session expired.' });
      }
      return res.json({ user: decoded.data, success: true, error: false });
    });
  },
  /**
   * Prepares the current user's account data for
   * update and sends a confirmation email in order to complete
   * the update. [PUT]
   * @param {Object} data
   * @return {Object}
   */
  async update(req, res) {
    if (!(req.body.email || req.body.business)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    const user = await User.findOne({ id: 1 });
    if (!user) {
      return res.json({ error: 'User not found.', success: false });
    }
    console.log('user', user);
    if (req.body.email && user.dataValues.email === req.body.email) {
      return res.json({ error: 'Email is already on file!', success: false });
    }

    const accountResetToken = `${genid()}`;
    const emailData = {
      accountResetToken,
      business: req.body.business ? req.body.business : null,
      email: req.body.email ? req.body.email : null,
    };
    user
      .update({ account_reset_token: accountResetToken })
      .then(_ => {
        sendEmail(
          'support@puro.com',
          user.email,
          'Confirm your changes!',
          getVerifyChangeEmail(emailData),
        )
          .then(_ => {
            console.log('email sent!');
            return res.json({ success: true, error: false });
          })
          .catch(error => {
            console.log(`sendEmail error: ${error}`);
            return res.json({
              error:
                'Error sending confirmation email, please contact support@puro.com',
              success: false,
            });
          });
      })
      .catch(error => {
        console.log('user update() error', error);
        return res.json({
          error: 'Error updating account, please contact support@puro.com',
          success: false,
        });
      });
  },
  /**
   * Resets the current user's password. [PUT]
   * @param {Object} req
   * @param {Object} res
   * @return {Object}
   */
  async reset(req, res) {
    if (!(req.body && req.body.currentPassword && req.body.newPassword)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    try {
      const { currentPassword, newPassword } = req.body;
      console.log(currentPassword, newPassword);
      const currentUser = await User.findOne({
        where: { id: req.query.user_id },
      });
      if (!currentUser) {
        return res.json({
          error: 'Non-existent session, please contact support.',
          success: false,
        });
      }

      bcrypt.compare(
        currentPassword,
        currentUser.password,
        async (error, isMatch) => {
          if (error) {
            return res.json({ error, success: false });
          }
          if (!isMatch) {
            return res.json({
              error: "That 'Current Password' is not on file.",
              success: false,
            });
          }
          let storedPassword = await genPassword(newPassword);
          bcrypt.compare(
            newPassword,
            currentUser.password,
            async (error, isMatch) => {
              if (error) {
                return res.json({ error, success: false });
              }
              if (isMatch) {
                return res.json({
                  error: "That 'new password' is already on file.",
                  success: false,
                });
              }
              currentUser
                .update({ password: storedPassword })
                .then(_ => res.json({ success: true, error: null }))
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
        },
      );
    } catch (error) {
      console.log(`reset password query error: ${error}`);
      res.json({ error, success: false });
    }
  },
  /**
   * Purpose: Verifies the current user's account after
   * they click on the verification link they receive in
   * the email we send above. [GET]
   * @param {Object} data
   * @return {Object}
   */
  async verify(req, res) {
    if (
      !(req.query && req.query.token && (req.query.email || req.query.business))
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const user = await User.findOne({ id: 1 });
    if (!user) {
      return res.json({ error: 'User not found.', success: false });
    }

    if (req.query.email && user.dataValues.email === req.query.email) {
      return res.json({ error: 'Email is already on file!', success: false });
    }

    const updatedData = getDataToUpdate(req.query);
    if (!updatedData) {
      return res.json({ error: 'Missing fields(updatedData)', success: false });
    }

    user
      .update({
        ...updatedData,
        account_reset_token: null,
      })
      .then(result => {
        const msg = 'Successfully updated account information!';
        let token = jwt.sign({ data: result.dataValues }, J_SECRET, {
          expiresIn: '1d',
        });
        console.log('creating cookie for token:', token);
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.clearCookie('user_token');
        res.cookie('user_token', token, {
          maxAge: 1000 * 60 * 15,
          signed: true,
        });
        return res.redirect(`${web_base}/dashboard?msg=${msg}&token=${token}`);
      })
      .catch(error => {
        console.log('user.update() error', error);
        return res.json({
          error: 'Error updating your account.',
          success: false,
        });
      });
  },
  /**
   * Purpose: Takes a daily snapshot of all the account data we have
   * for chronological reporting. [GET] (ADMIN ONLY)
   * @param {*} req
   * @param {*} res
   */
  async snapshot(req, res) {
    const users = await User.findAll({
      attributes: ['id'],
    });
    if (!users) {
      console.log('Failed to pull all users.');
      return res.json({ error: 'No users.', success: false });
    }

    let errors = [];
    let success = true;
    users.forEach(async user => {
      const campaigns = await Campaign.findAll({
        attributes: ['id'],
        where: { user_id: user.dataValues.id },
      });
      console.log('campaigns:', campaigns);
      if (campaigns) {
        const { error, clicks, entries } = await aggregateTotals(campaigns);
        errors.push(error);
        const snapshotData = {
          clicks,
          entries,
          user_id: user.dataValues.id,
          campaigns: campaigns.length,
        };
        console.log('Persistent Snapshot Data:', snapshotData);
        Snapshot.create(snapshotData)
          .then(_ => {
            console.log('CRON JOB(snapshot) succeeded');
            success = true;
          })
          .catch(error => {
            console.log('CRON JOB(snapshot) error: ', error);
            errors.push('Snapshot failed.');
            success = false;
          });
      }
    });
    return res.json({ errors, success });
  },
};
