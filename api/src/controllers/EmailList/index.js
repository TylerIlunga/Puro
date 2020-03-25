/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/EmailList
 *  Purpose       :  Module for the EmailList service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   add()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const db = require('../../db');
const EmailList = db.EmailList;
const Sequelize = db.getClient();

module.exports = {
  /**
   * add[GET]
   * Adds a new email to our email list.
   */
  add(req, res) {
    // NOTE: handle recaptchaResponse
    if (!(req.query && req.query.e && req.query.r)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    EmailList.findOne({ where: { email: req.query.e } })
      .then(email => {
        if (email) {
          return res.json({ error: 'Email exists!', success: false });
        }
        EmailList.create({ email: req.query.e })
          .then(result => {
            console.log('success saving email!');
            return res.json({ success: true, error: false });
          })
          .catch(error => {
            console.log('error', error);
            return res.json({
              error: 'Error saving email! Please contact support@puro.com',
              success: false,
            });
          });
      })
      .catch(error => {
        console.log('error', error);
        return res.json({
          error: 'Error saving email! Please contact support@puro.com',
          success: false,
        });
      });
  },
};
