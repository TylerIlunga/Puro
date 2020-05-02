/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Instagram
 *  Purpose       :  Module for the Instagram OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  3
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const Instagram = require('node-instagram').default;
const config = require('../config');
const db = require('../../../db');
const { gatherAnalytics } = require('../../../tools');
const Entry = db.Entry;

let account = null;

let instagram = new Instagram({
  clientId: config.instagram.client_id,
  clientSecret: config.instagram.client_secret,
});

module.exports = {
  /**
   * oauth[GET]
   * @param {Object} req
   * @param {Object} res
   */
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      pid: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    res.redirect(
      instagram.getAuthorizationUrl(
        config.instagram.redirect_uri,
        config.instagram.scopes,
        'state', // an optional state
      ),
    );
  },
  /**
   * callback[GET]
   * @param {Object} req
   * @param {Object} res
   */
  callback(req, res) {
    if (!(account && req.query.code)) {
      return res.json({ error: 'OAuth required!', success: false });
    }

    instagram
      .authorizeUser(req.query.code, config.instagram.redirect_uri)
      .then(async (data) => {
        console.log('instagram.authorizeUser() data', data);
        instagram = new Instagram({
          clientId: config.instagram.client_id,
          clientSecret: config.instagram.client_secret,
          accessToken: data.access_token,
        });
        // You can use callbacks or promises
        instagram.get('users/self', async (err, sData) => {
          if (err) {
            // NOTE: might still redirect to campaign page but email admin account instead
            console.log('instagram.get() ERR:', err);
            return res.json({
              error: "Error getting instagram user's data",
              success: false,
            });
          }

          const instagramData = sData.data;
          const userEntry = await Entry.findOne({
            where: { company_id: instagramData.id },
          });
          if (userEntry) {
            console.log('Entry exists (Update)');
            return userEntry
              .update({ clicks: userEntry.dataValues.clicks + 1 })
              .then((_) => res.redirect(account.redirect_uri))
              .catch((error) => {
                console.log('userEntry.update() error', error);
                res.redirect(account.redirect_uri);
              });
          }

          Entry.create({
            company_id: instagramData.id,
            username: instagramData.username,
            campaign_id: account.campaign_id,
          })
            .then(async (entry) => {
              console.log('success saving entry', entry);

              res.redirect(account.redirect_uri);

              account['entry_id'] = entry.dataValues.id;

              gatherAnalytics(req, account, 'instagram', instagramData);
            })
            .catch((error) => {
              // NOTE: Redirect to campaign page and notify admin account instead
              console.log('success saving entry', entry);
              res.redirect(account.redirect_uri);
            });
        });
      })
      .catch((err) => {
        // NOTE: Redirect to campaign page and notify admin account instead
        console.log('Error in Instagram Logging pipeline', err.message);
        res.redirect(account.redirect_uri);
      });
  },
};
