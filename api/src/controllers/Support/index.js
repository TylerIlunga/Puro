/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Support
 *  Purpose       :  Module for the Support service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Support".
 *                   Includes the following:
 *                   submitIssue()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const db = require('../../db');
const Issue = db.Issue;

module.exports = {
  /**
   * submitIssue[POST]
   * Stores current user's ticket ID in database and sends
   * out email to us(issue, ticket id, user_id) and
   * to the current user(confirmation and ticket id)
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
      .then(result => {
        // NOTE: switch to Mailchimp from mailgun?
        // Email to use
        // Email to them
        console.log('Issue.create resolved', result);
        return res.json({ success: true, error: false });
      })
      .catch(error => {
        console.log('Issue.create error', error);
        return res.json({ error: 'Creating issue error.', success: false });
      });
  },
};
