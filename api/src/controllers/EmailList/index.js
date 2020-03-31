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

module.exports = {
  /**
   * Adds a new email to our email list.
   */
  add(req, res) {
    if (!(req.query && req.query.e)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    EmailList.findOne({ where: { email: req.query.e } })
      .then(async email => {
        if (email) {
          return res.json({ error: 'Email exists!', success: false });
        }
        await EmailList.create({ email: req.query.e });
        console.log('New email appended to our list :)');
        return res.json({ success: true, error: false });
      })
      .catch(error => {
        console.log('.add()', error);
        return res.json({
          error: 'Error saving email! Please contact support@puro.com',
          success: false,
        });
      });
  },
};
