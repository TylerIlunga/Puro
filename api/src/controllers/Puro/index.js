/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Puro
 *  Purpose       :  Module for the Puro service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for the shareable Puro link.
 *                   Includes the following:
 *                   analyze()
 *                   fetchLink()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const { base } = require('../../config');
const db = require('../../db');
const Sequelize = db.getClient();
const Op = Sequelize.Op;
const Company = db.Company;
const Puro = db.Puro;

module.exports = {
  /**
   * analyze[GET]
   * Detects which campaign the consumer is participating,
   * assembles the redirect_uri to contain important analytical
   * information, and redirects the consumer to the oauth endpoint.
   */
  analyze(req, res) {
    if (
      !(req.query && req.query.c && req.query.p && req.query.a && req.query.r)
    ) {
      return res.json({ error: 'Invalid link.', success: false });
    }
    const campaign_id = req.query.c;
    const pid = req.query.p;
    const user_id = req.query.a;
    const redirect_uri = req.query.r;

    Company.findOne({
      where: {
        [Op.and]: [{ campaign_id }, { campaign_tag: pid }],
      },
    })
      .then(company => {
        if (!company) {
          return res.json({
            error: 'Company not found! Please contact support@puro.com',
            success: false,
          });
        }
        const { name, puro_id } = company.dataValues;
        res.redirect(
          `${base}/api/oauth/${name}?c=${campaign_id}&p=${puro_id}&a=${user_id}&r=${redirect_uri}`,
        );
      })
      .catch(error => {
        console.log('error', error);
        return res.json({
          error: 'Error fetching company! Please contact support@puro.com',
          success: false,
        });
      });
  },
  /**
   * fetchLink[GET]
   * Returns the [Puro*for now*] link to the current user for
   * a specified campaign.
   */
  fetchLink(req, res) {
    if (!(req.query && req.query.cid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    Puro.findOne({ where: { campaign_id: req.query.cid } })
      .then(puro => {
        console.log('Puro.findOne() puro:::', puro);
        return res.json({ link: puro.dataValues.link, error: false });
      })
      .catch(error => {
        console.log('Puro.findOne error:::', error);
        return res.json({
          error: 'Error fetching puro link. Contact support.',
          success: false,
        });
      });
  },
};
