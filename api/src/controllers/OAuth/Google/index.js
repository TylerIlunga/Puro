/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Google
 *  Purpose       :  Module for the Google OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const { google } = require('googleapis');
const config = require('../config');
const { gatherAnalytics } = require('../../../tools');
const db = require('../../../db');
const Entry = db.Entry;
const LinkedAccount = db.LinkedAccount;
const User = db.User;
const Sequelize = db.getClient();
const Op = Sequelize.Op;

//NOTE: Will have to update Google Console redirect_uri!

let account = null;

const oauth2Client = new google.auth.OAuth2(
  config.google.client_id,
  config.google.client_secret,
  config.google.redirect_uri,
);

/**
 * linkAccount
 * @param {string} userId
 * @param {Object} tokens
 * @param {Object} res
 */
const linkAccount = async (userId, token, res) => {
  const linkedAccount = await LinkedAccount.findOne({
    where: {
      [Op.and]: [{ user_id: userId }, { company: 'Google' }],
    },
  });
  if (linkedAccount) {
    console.log('Linked Account already on file for (Google)');
    return res.json({
      success: false,
      error: 'Your Google Account has been linked.',
    });
  }
  LinkedAccount.create({
    company: 'Google',
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expiry_date: token.expiry_date,
    user_id: account.user_id,
  })
    .then(result => {
      console.log('linkedAccount.create result', result);
      account = null;
      delete account;
      let msg = { success: true, error: false };
      return res.send(config.broadcastChannel(msg));
    })
    .catch(error => {
      console.log('linkedAccount.create error', error);
      account = null;
      delete account;
      return res.json({
        success: false,
        error: 'Error linking account. Contact Support.',
      });
    });
};

module.exports = {
  /**
   * oauth[GET]
   * Redirects current user to Google's authentication view.
   */
  oauth(req, res) {
    if (req.query && req.query.connect && req.query.uid) {
      account = {
        linking: true,
        user_id: req.query.uid,
      };
      return res.json({
        authLink: oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: config.google.scopes.account,
        }),
      });
    }
    account = {
      linking: false,
      campaign_id: req.query.c,
      pid: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    res.redirect(
      oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: config.google.scopes.entry,
      }),
    );
  },
  /**
   * callback[GET]
   * Gathers current user's data allowed by Google, organizes that data,
   * and stores it for future analysis.
   */
  async callback(req, res) {
    console.log('req.query', req.query);
    if (!(account && req.query.code && req.query)) {
      return res.json({ error: 'OAuth required!', success: false });
    }
    const oauth2Data = await oauth2Client.getToken(req.query.code);
    if (!oauth2Data.tokens) {
      return res.json({
        error: 'Error getting tokens from token data!',
        success: false,
      });
    }
    console.log('tokens', oauth2Data.tokens);
    //** Linking (NOT CAMPAIGN RELATED) */
    if (account.linking && account.user_id) {
      return linkAccount(account.user_id, oauth2Data.tokens, res);
    }

    oauth2Client.setCredentials(oauth2Data.tokens);
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    console.log('oauth2', oauth2);

    oauth2.userinfo.v2.me.get(async (err, profile) => {
      if (err) {
        return res.json({
          error: 'Error getting profile data via oauth2!',
          success: false,
        });
      }
      const googleData = profile.data;
      console.log('googleData', googleData);
      const userEntry = await Entry.findOne({
        where: { company_id: googleData.id },
      });
      if (userEntry) {
        console.log('entry exists:::::', userEntry);
        return userEntry
          .update({ clicks: userEntry.dataValues.clicks + 1 })
          .then(result => res.redirect(account.redirect_uri))
          .catch(error => {
            console.log('userEntry.update() error', error);
            // return res.json({ error: "Error updating clicks count!", success: false });
            return res.redirect(account.redirect_uri);
          });
      }
      Entry.create({
        company_id: googleData.id,
        email: googleData.email,
        username: googleData.name,
        campaign_id: account.campaign_id,
      })
        .then(async entry => {
          console.log('success saving entry', entry);
          res.redirect(account.redirect_uri);
          const user = await User.findOne({ where: { id: 1 } });
          // if (!user || user.subscription === "free") {
          //   return console.log('No user or subscription === free for account: ', account.user_id);
          // }
          const analyticalLog = {
            ...googleData,
            access_token: oauth2Data.tokens.access_token,
            refresh_token: oauth2Data.tokens.refresh_token,
            token_expiry_date: oauth2Data.tokens.expiry_date,
            ip: req.ip,
            link: account.redirect_uri,
          };
          console.log('analyticalLog', analyticalLog);
          account['entry_id'] = entry.dataValues.id;
          gatherAnalytics(req, account, analyticalLog, 'google');
        })
        .catch(error => {
          return res.json({ error: 'Error saving entry!', success: false });
        });
    });
  },
};
