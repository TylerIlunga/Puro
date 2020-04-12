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
 * Organize's Facebook's Error and sends it as a response.
 * @param {Object} res
 * @param {Object} res
 */
const handleCallbackError = (req, res) => {
  res.json({
    error: {
      errorMessage: req.query.error,
      errorCode: req.query.error_code,
      errorDescription: req.query.error_description,
      errorReason: req.query.error_reason,
    },
    success: false,
  });
};

/**
 *
 */
const gatherMetadata = (req, res, facebookData, access_token, entry) => {
  res.redirect(account.redirect_uri);
  console.log('Gathering metadata needed for future data-driven decisions...');
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
};

module.exports = {
  /**
   * Redirects current user to Facebook's authentication view.
   * @param {Object} res
   * @param {Object} res
   */
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      puro_id: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    res.redirect(
      FB.getLoginUrl({
        client_id: config.facebook.client_id,
        scope: config.facebook.scopes.dev,
        redirect_uri: config.facebook.redirect_uri,
      }),
    );
  },
  /**
   * Gathers current user's data allowed by Facebook,
   * organizes that data, handles link (entry) activity, and stores it for future analysis.
   * @param {Object} res
   * @param {Object} res
   */
  callback(req, res) {
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
      (oAuthRes) => {
        if (!oAuthRes || oAuthRes.error) {
          console.log('oAuthRes.error:::', oAuthRes.error);
          return res.json({
            error: 'oauth/access_token error occurred',
            success: false,
          });
        }
        console.log('oAuthRes', oAuthRes);
        const access_token = oAuthRes.access_token;
        FB.api(
          'me',
          { access_token, fields: config.facebook.fields.profile },
          async (fData) => {
            const facebookData = fData;
            const userEntry = await Entry.findOne({
              where: { company_id: facebookData.id },
            });
            if (userEntry) {
              console.log('entry exists:::::', userEntry);
              return userEntry
                .update({ clicks: userEntry.dataValues.clicks + 1 })
                .then((_) => {
                  gatherMetadata(
                    req,
                    res,
                    facebookData,
                    access_token,
                    userEntry.dataValues,
                  );
                })
                .catch((error) => {
                  console.log('userEntry.update() error', error);
                  res.redirect(account.redirect_uri);
                });
            }
            Entry.create({
              company_id: facebookData.id,
              email: facebookData.email,
              campaign_id: account.campaign_id,
            })
              .then(async (entry) => {
                console.log('Success saving new entry:', entry);
                console.log('Async redirect to campaign destination.');
                gatherMetadata(req, res, facebookData, access_token, entry);
              })
              .catch((error) => {
                console.log('Entry.create() error', error);
              });
          },
        );
      },
    );
  },
};
