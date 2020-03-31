/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Support
 *  Purpose       :  Module for the Support service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-31
 *  Description   :  Module that holds all of the services for customer support.
 *                   Includes the following:
 *                   submitIssue()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const db = require('../../db');
const Issue = db.Issue;

module.exports = {
  /**
   * Stores current user's ticket ID in the database.
   * @param {Object} req
   * @param {Object} res
   */
  async submitIssue(req, res) {
    if (
      !(
        req.query &&
        req.query.tid &&
        req.query.uid &&
        req.body &&
        req.body.issue &&
        req.body.subject
      )
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const issue = await Issue.findOne({
      where: { ticket_id: req.query.ticketId },
    });
    if (issue) {
      return res.json({
        error: 'Ticket already exists.',
        success: false,
      });
    }

    Issue.create({
      ticket_id: req.query.tid,
      user_id: req.query.uid,
    })
      .then(_ => res.json({ success: true, error: false }))
      .catch(error => {
        console.log('.create() error', error);
        res.json({ error: 'Creating issue error.', success: false });
      });
  },
};
