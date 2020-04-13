/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Twitter
 *  Purpose       :  Module for the Twitter OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   checkForDescriptionUrl()
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const config = require('../config');
const { gatherAnalytics } = require('../../../tools');
const twitterAPI = require('node-twitter-api');
const db = require('../../../db');
const Sequelize = db.getClient();
const Op = Sequelize.Op;
const Entry = db.Entry;
const User = db.User;

let account = null;

// NOTE: switch to .env-prod file for all keys in the future.

var client = new twitterAPI({
  consumerKey: config.twitter.client_id,
  consumerSecret: config.twitter.client_secret,
  callback: config.twitter.redirect_uri,
});

/**
 * checkForDescriptionUrl
 * @param {Object} entities
 */
const checkForDescriptionUrl = (entities) => {
  console.log('checkForDescriptionUrl() entities', entities);
  if (
    entities &&
    entities.url &&
    entities.url.urls &&
    entities.url.urls.length > 0
  ) {
    return entities.url.urls[0].display_url;
  }
  return null;
};

module.exports = {
  /**
   * oauth[GET]
   * Redirects current user to Twitter's authentication view.
   */
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      pid: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };

    client.getRequestToken(
      (error, requestToken, requestTokenSecret, results) => {
        if (error) {
          return res.json({
            error: 'Error retrieving request token.',
            success: false,
          });
        }
        account.requestToken = requestToken;
        account.requestTokenSecret = requestTokenSecret;
        res.redirect(client.getAuthUrl(requestToken));
      },
    );
  },
  /**
   * callback[GET]
   * Gathers current user's data allowed by Twitter, organizes that data,
   * and stores it for future analysis.
   */
  callback(req, res) {
    if (!(account && req.query.oauth_token && req.query.oauth_verifier)) {
      return res.json({ error: 'OAuth required.', success: false });
    }
    client.getAccessToken(
      account.requestToken,
      account.requestTokenSecret,
      req.query.oauth_verifier,
      (error, accessToken, accessTokenSecret, results) => {
        if (error) {
          console.log('client.getAccessToken() error', error);
          return res.json({
            error: 'Error getting user access token',
            success: false,
          });
        }
        console.log('client.getAccessToken()', results);
        client.verifyCredentials(
          accessToken,
          accessTokenSecret,
          async (vError, user, vRes) => {
            if (vError) {
              console.log('client.verifyCredentials() error', error);
              return res.json({
                error: 'Error verifying verifyCredentials.',
                success: false,
              });
            }
            const twitterData = user;
            const entry = await Entry.findOne({
              where: {
                [Op.and]: [
                  { username: twitterData.screen_name },
                  { campaign_id: account.campaign_id },
                ],
              },
            });

            if (entry) {
              console.log('entry exists:::::', entry);
              return entry
                .update({ clicks: entry.dataValues.clicks + 1 })
                .then((_) => res.redirect(account.redirect_uri))
                .catch((error) => {
                  console.log('entry.update() error', error);
                  return res.redirect(account.redirect_uri);
                });
            }

            Entry.create({
              company_id: twitterData.id_str,
              email: twitterData.email ? twitterData.email : null,
              username: twitterData.screen_name,
              campaign_id: account.campaign_id,
            })
              .then(async (entry) => {
                console.log('success saving entry', entry);
                res.redirect(account.redirect_uri);
                // const user = await User.findOne({ id: account.user_id });
                // if (!user || user.subscription === "free") {
                //   return console.log('No user or subscription === free for account: ', account.user_id);
                // }
                twitterData['creation'] = twitterData['created_at'];
                twitterData['created_at'] = null;
                delete twitterData['created_at'];
                twitterData['id'] = null;
                delete twitterData['id'];
                const analyticalLog = {
                  ...twitterData,
                  access_token: accessToken,
                  access_token_secret: accessTokenSecret,
                  account_creation_date: twitterData.creation,
                  description_url: checkForDescriptionUrl(twitterData.entities),
                  ip: req.ip,
                  link: account.redirect_uri,
                };
                account['entry_id'] = entry.dataValues.id;
                gatherAnalytics(req, account, 'twitter', analyticalLog);
              })
              .catch((error) => {
                console.log('Error saving entry:::::', error);
              });
          },
        );
      },
    );
  },
};
