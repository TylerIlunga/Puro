/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Facebook
 *  Purpose       :  Module for the Facebook OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   handleCallbackError()
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const config = require('../config');
const { FB } = require('fb');
const db = require('../../../db');
const { gatherAnalytics } = require('../../../tools');
const Entry = db.Entry;
const User = db.User;

let account = null;

/**
 * handleCallbackError
 *
 * Organize's Facebook's Error and sends it as a response.
 */
const handleCallbackError = (req, res) => {
  return res.json({
    error: {
      errorMessage: req.query.error,
      errorCode: req.query.error_code,
      errorDescription: req.query.error_description,
      errorReason: req.query.error_reason,
    },
    success: false,
  });
};

module.exports = {
  /**
   * oauth[GET]
   * Redirects current user to Facebook's authentication view.
   */
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      puro_id: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    // console.log('account::::', account);
    return res.redirect(
      FB.getLoginUrl({
        client_id: config.facebook.client_id,
        scope: config.facebook.scopes.dev,
        redirect_uri: config.facebook.redirect_uri,
      }),
    );
    // res.json({authorizeURL});
  },
  /**
   * callback[GET]
   * Gathers current user's data allowed by Github, organizes that data,
   * and stores it for future analysis.
   */
  callback(req, res) {
    // console.log('req.query', req.query);
    if (!account) {
      return res.json({ error: 'OAuth required!', success: false });
    }
    if (req.query.error) {
      return handleCallbackError(req, res);
    }
    FB.api(
      'oauth/access_token',
      {
        client_id: config.facebook.client_id,
        client_secret: config.facebook.client_secret,
        redirect_uri: config.facebook.redirect_uri,
        code: req.query.code,
      },
      oAuthRes => {
        if (!oAuthRes || oAuthRes.error) {
          console.log('oAuthRes.error:::', oAuthRes.error);
          return res.json({
            error: 'oauth/access_token error occurred',
            success: false,
          });
        }
        console.log('oAuthRes', oAuthRes);
        const access_token = oAuthRes.access_token;
        // const refresh_token = oAuthRes.refresh_token;
        // NOTE: will update based on app review decision!
        FB.api(
          'me',
          { access_token, fields: config.facebook.fields.profile },
          async fData => {
            const facebookData = fData;
            console.log('personal FB DATA:::::', facebookData);
            const userEntry = await Entry.findOne({
              where: { company_id: facebookData.id },
            });
            // if (userEntry) {
            //   console.log('entry exists:::::', userEntry);
            //   return userEntry
            //     .update({ clicks: userEntry.dataValues.clicks + 1 })
            //     .then(result => res.redirect(account.redirect_uri))
            //     .catch(error => {
            //       console.log('userEntry.update() error', error);
            //       // return res.json({ error: "Error updating clicks count!", success: false });
            //       return res.redirect(account.redirect_uri);
            //     });
            // }
            Entry.create({
              company_id: facebookData.id,
              email: facebookData.email,
              campaign_id: account.campaign_id,
            })
              .then(async entry => {
                console.log('success saving entry', entry);
                console.log('account.redirect_uri:', account.redirect_uri);
                res.redirect(account.redirect_uri);
                const analyticalLog = {
                  ...facebookData,
                  access_token,
                  campaign_id: account.campaign_id,
                  ip: req.ip,
                  puro_id: account.puro_id,
                  link: account.redirect_uri,
                };
                account['entry_id'] = entry.dataValues.id;
                console.log('analyticalLog', analyticalLog);
                gatherAnalytics(req, account, analyticalLog, 'facebook');
              })
              .catch(error => {
                console.log('Entry.create() error', error);
              });
          },
        );
      },
    );
  },
};
