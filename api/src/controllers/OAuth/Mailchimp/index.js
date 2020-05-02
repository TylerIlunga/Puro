/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Mailchimp
 *  Purpose       :  Module for the Mailchimp OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Mailchimp" Oauth.
 *                   Includes the following:
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const axios = require('axios');
const config = require('../config');
const db = require('../../../db');
const LinkedAccount = db.LinkedAccount;

let account = null;

module.exports = {
  /**
   * oauth [GET]
   * @param {*} req
   * @param {*} res
   */
  oauth(req, res) {
    if (!(req.query && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: true });
    }
    account = { user_id: req.query.uid };
    res.json({
      authLink: `https://login.mailchimp.com/oauth2/authorize?response_type=code&client_id=${config.mailchimp.client_id}&redirect_uri=${config.mailchimp.redirect_uri}`,
    });
  },
  /**
   * callback [GET]
   * @param {Object} req
   * @param {Object} res
   */
  callback(req, res) {
    if (!(req.query && req.query.code)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    // grant_type=authorization_code&client_id={client_id}&client_secret={client_secret}&redirect_uri={encoded_url}&code={code}
    const body = `grant_type=authorization_code&client_id=${config.mailchimp.client_id}&client_secret=${config.mailchimp.client_secret}&redirect_uri=${config.mailchimp.redirect_uri}&code=${req.query.code}`;
    const meta = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    axios
      .post('https://login.mailchimp.com/oauth2/token', body, meta)
      .then((response) => {
        if (response.data.error) {
          throw response.data.error;
        }
        const mailchimpTokenData = response.data;
        LinkedAccount.create({
          access_token: mailchimpTokenData.access_token,
          company: 'Mailchimp',
          user_id: account.user_id,
          expiry_date: mailchimpTokenData.expires_in,
        })
          .then((_) => {
            account = null;
            res.send(config.broadcastChannel({ success: true, error: false }));
          })
          .catch((error) => {
            console.log('LinkedAccount.create() error:', error);
            account = null;
            res.json({
              error: 'Error linking account. Contact support.',
              success: false,
            });
          });
      })
      .catch((error) => {
        console.log('axios post mailchimp/oauth2/token error:', error);
        res.json({
          error: 'Error linking account. Contact support.',
          success: false,
        });
      });
  },
};
