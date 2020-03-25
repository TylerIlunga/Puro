const db = require('../../db');
const LinkedAccount = db.LinkedAccount;
const Sequelize = db.getClient();
const Op = Sequelize.Op;

module.exports = {
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
    let resBody = {
      MailchimpIsConnected: false,
      GoogleIsConnected: false,
    };
    linkedAccounts.map(account => {
      account = account.dataValues;
      if (!resBody[`${account.company}IsConnected`]) {
        resBody[`${account.company}IsConnected`] = true;
      }
    });
    res.json(resBody);
  },
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
      .then(result => {
        console.log('linkedAccount.destroy() res', result);
        return res.json({ success: true, error: false });
      })
      .catch(error => {
        console.log('linkedAccount.destroy() error', error);
        return res.json({
          success: false,
          error: 'Error unlinking account. Contact support.',
        });
      });
  },
};
