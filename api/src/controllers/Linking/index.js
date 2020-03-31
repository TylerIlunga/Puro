/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Linking
 *  Purpose       :  Module for the Linking service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-31
 *  Description   :  Module that holds all of the services for handling third-party accounts.
 *                   Includes the following:
 *                   fetch()
 *                   unlink()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
const db = require('../../db');
const LinkedAccount = db.LinkedAccount;
const Sequelize = db.getClient();
const Op = Sequelize.Op;

module.exports = {
  /**
   * Fetches thrid-party information linked to the current user's account.
   * @param {Object} req
   * @param {Object} res
   */
  async fetch(req, res) {
    if (!(req.query && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const linkedAccounts = await LinkedAccount.findAll({
      attributes: ['company'],
      where: { user_id: req.query.uid },
    });
    if (!linkedAccounts) {
      return res.json({
        MailchimpIsConnected: false,
        GoogleIsConnected: false,
      });
    }

    const resBody = {
      MailchimpIsConnected: false,
      GoogleIsConnected: false,
    };

    linkedAccounts.forEach(account => {
      account = account.dataValues;
      const isLinked = resBody[`${account.company}IsConnected`];
      if (!isLinked) {
        isLinked = true;
      } else if (isLinked === undefined) {
        resBody[`${account.company}IsConnected`] = true;
      }
    });

    res.json(resBody);
  },
  /**
   * Unlinks thrid-party information linked to the current user's account.
   * @param {Object} req
   * @param {Object} res
   */
  async unlink(req, res) {
    if (!(req.query && req.query.uid && req.query.company)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const linkedAccount = await LinkedAccount.findOne({
      where: {
        [Op.and]: [{ user_id: req.query.uid }, { company: req.query.company }],
      },
    });
    if (!linkedAccount) {
      console.log(`No Linked Account on file for ${req.query.company}`);
      return res.json({
        success: false,
        error: 'Error unlinking account. Contact support.',
      });
    }

    linkedAccount
      .destroy()
      .then(_ => res.json({ success: true, error: false }))
      .catch(error => {
        console.log('.destroy() error', error);
        res.json({
          success: false,
          error: 'Error unlinking account. Contact support.',
        });
      });
  },
};
