/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Entry
 *  Purpose       :  Module for the Entry service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-31
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   getDataToUpdate()
 *                   list()
 *                   create()
 *                   update()
 *                   delete()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const db = require('../../db');
const Sequelize = db.getClient();
const Op = Sequelize.Op;
const Entry = db.Entry;

/**
 * Organizes the request's body into a Data Structure for
 * the database to interpret and update values in Campaign's
 * table.
 * @param {Object} body
 * @returns {?Object}
 */
const getDataToUpdate = (body) => {
  if (body.email && body.age) {
    return {
      email: body.email,
      age: body.age,
    };
  }
  if (body.email) {
    return { email: body.email };
  }
  if (body.age) {
    return { age: body.age };
  }
  return null;
};

module.exports = {
  /**
   * List entries for a given campaign via the campaign's ID.
   * @param {Object} req
   * @param {Object} res
   */
  list(req, res) {
    if (!(req.query && req.query.cid && req.query.limit)) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const attributes = ['email', 'clicks', 'username', 'created_at'];
    Entry.findAll({
      attributes,
      where: { campaign_id: req.query.cid },
      limit: req.query.limit,
      order: [['created_at', 'DESC']],
    })
      .then((entries) => {
        console.log('entries', entries);
        res.json({ entries, success: true, error: null });
      })
      .catch((_) => {
        res.json({
          error: "Error fetching the given campaign's entries",
          entries: null,
          success: false,
        });
      });
  },
  /**
   * Creates a new campaign entry for seeding.
   * @param {Object} req
   * @param {Object} res
   */
  create(req, res) {
    if (!(req.query && req.query.campaign_id && req.query.entries)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    console.time('Total Duration');
    let entryCreations = [];
    console.log('creating entries...');
    for (let i = 1; i < req.query.entries; i++) {
      entryCreations.push(
        Entry.create({
          campaign_id: req.query.campaign_id,
          email: `test${i}@gmail.com`,
          username: `test_${i}`,
          age: i,
          clicks: i + 1,
        }),
      );
    }
    console.log('populating database...');
    Promise.all(entryCreations)
      .then((_) => {
        console.log('entries created!');
        console.timeEnd('Total Duration');
        return res.json({ success: true, error: null });
      })
      .catch((error) => {
        console.log('.create() error', error);
        return res.json({
          error: 'Error persisting  entries.',
          success: false,
        });
      });
  },
  /**
   * Updates a campaign's entry.
   * @param {Object} req
   * @param {Object} res
   */
  async update(req, res) {
    if (
      !(
        (req.body.email || req.body.age || req.body.city) &&
        req.query.cid &&
        req.query.id
      )
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const entry = await Entry.findOne({
      where: {
        [Op.and]: [{ id: req.query.id }, { campaign_id: req.query.cid }],
      },
    });
    if (!entry) {
      return res.json({ error: 'Error getting entry.', success: false });
    }

    const updatedData = getDataToUpdate(req.body);
    if (!updatedData) {
      return res.json({
        error: 'Missing fields for an updated entry.',
        success: false,
      });
    }

    entry
      .update(updatedData)
      .then((_) => res.json({ success: true, error: null }))
      .catch((error) => {
        console.log('update() error', error);
        res.json({
          error: 'Error updating this entry.',
          success: false,
        });
      });
  },
  /**
   * Deletes a campaign's entry.
   * @param {Object} req
   * @param {Object} res
   */
  async delete(req, res) {
    if (!(req.query && req.query.id && req.query.cid)) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const entry = await Entry.findOne({
      where: {
        [Op.and]: [{ id: req.query.id }, { campaign_id: req.query.cid }],
      },
    });
    if (!entry) {
      return res.json({ error: 'Error getting entry.', success: false });
    }

    entry
      .destroy()
      .then((_) => res.json({ success: true, error: null }))
      .catch((error) => {
        console.log('.destroy() error', error);
        return res.json({
          error: 'Error deleting entry, please contact support@puro.com',
          success: false,
        });
      });
  },
};
