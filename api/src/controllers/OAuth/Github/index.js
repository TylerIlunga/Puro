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
   * Redirects current user to Github's authentication view.
   * @param {Object} res
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
      `https://github.com/login/oauth/authorize?scope=user&client_id=${github.client_id}&redirect_uri=${github.redirect_uri}&state=${state}`,
    );
  },
  /**
   * Gathers current user's data allowed by Github,
   * organizes that data, and stores it for future analysis.
   * @param {Object} res
   * @param {Object} res
   */
  callback(req, res) {
    if (!(account && req.query.code && req.query.state)) {
      return res.json({ error: 'OAuth required.', success: false });
    }
    const oauthCBLink = `https://github.com/login/oauth/access_token?client_id=${github.client_id}&client_secret=${github.client_secret}&code=${req.query.code}&redirect_uri=${github.redirect_uri}&state=${req.query.state}`;
    let headers = {
      Accept: 'application/json',
    };
    axios
      .post(oauthCBLink, {}, { headers: headers })
      .then(async (ghRes) => {
        headers = { Authorization: `token ${ghRes.data.access_token}` };
        ghRes = await axios.get('https://api.github.com/user', {
          headers: headers,
        });

        const githubData = ghRes.data;
        const userEntry = await Entry.findOne({
          where: { company_id: `${githubData.id}` },
        });
        if (userEntry) {
          return userEntry
            .update({ clicks: userEntry.dataValues.clicks + 1 })
            .then((_) => res.redirect(account.redirect_uri))
            .catch((error) => {
              console.log('userEntry.update() error', error);
              res.redirect(account.redirect_uri);
            });
        }

        const entry = await Entry.create({
          company_id: `${githubData.id}`,
          email: githubData.email,
          username: githubData.login,
          campaign_id: account.campaign_id,
        });

        console.log('New entry (Github):', entry);
        res.redirect(account.redirect_uri);
        account['entry_id'] = entry.dataValues.id;

        gatherAnalytics(req, account, 'github', {
          ...githubData,
          ip: req.ip,
          link: account.redirect_uri,
        });
      })
      .catch((error) => {
        console.log('Github callback() error:', error.message);
        res.json({ error: error.message });
      });
  },
};
