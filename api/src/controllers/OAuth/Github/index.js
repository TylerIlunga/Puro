/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Github
 *  Purpose       :  Module for the Github OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const axios = require('axios');
const { github } = require('../config');
const { gatherAnalytics } = require('../../../tools');
const db = require('../../../db');
const { genid } = require('../../../db/config');
const Entry = db.Entry;

let account = null;
const state = genid();

module.exports = {
  /**
   * oauth[GET]
   * Redirects current user to Github's authentication view.
   */
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      pid: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    const link = `https://github.com/login/oauth/authorize?scope=user&client_id=${github.client_id}&redirect_uri=${github.redirect_uri}&state=${state}`;
    res.redirect(link);
  },
  /**
   * callback[GET]
   * Gathers current user's data allowed by Github, organizes that data,
   * and stores it for future analysis.
   */
  callback(req, res) {
    if (!(account && req.query.code && req.query.state)) {
      return res.json({ error: 'OAuth required.', success: false });
    }
    const link = `https://github.com/login/oauth/access_token?client_id=${github.client_id}&client_secret=${github.client_secret}&code=${req.query.code}&redirect_uri=${github.redirect_uri}&state=${req.query.state}`;
    let headers = {
      Accept: 'application/json',
    };
    axios
      .post(link, {}, { headers: headers })
      .then(({ data }) => {
        headers = { Authorization: `token ${data.access_token}` };
        axios
          .get('https://api.github.com/user', { headers: headers })
          .then(async ({ data }) => {
            const githubData = data;
            const userEntry = await Entry.findOne({
              where: { company_id: `${githubData.id}` },
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
              company_id: `${githubData.id}`,
              email: githubData.email,
              username: githubData.login,
              campaign_id: account.campaign_id,
            })
              .then(async entry => {
                console.log('success saving entry', entry);
                res.redirect(account.redirect_uri);
                const analyticalLog = {
                  ...githubData,
                  ip: req.ip,
                  link: account.redirect_uri,
                };
                // console.log('analyticalLog', analyticalLog);
                account['entry_id'] = entry.dataValues.id;
                gatherAnalytics(req, account, analyticalLog, 'github');
              })
              .catch(error => {
                console.log('error', error);
                return res.json({
                  error: 'Error saving entry!',
                  message: error.message,
                  success: false,
                });
              });
          })
          .catch(error => {
            throw error;
          });
      })
      .catch(err => {
        console.log(`github oauth() access_token error`, err.message);
        return res.json({ error: err.message });
      });
  },
};
