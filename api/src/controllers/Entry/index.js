/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Entry
 *  Purpose       :  Module for the Entry service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   getAttributes()
 *                   getDataToUpdate()
 *                   list()
 *                   create()
 *                   update()
 *                   delete()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const db = require('../../db');
const Sequelize = db.getClient();
const Op = Sequelize.Op;
const Entry = db.Entry;

/**
 * getAttributes
 *
 * Gathers specific attributes needed to be returned
 * after a query.
 */
const getAtrributes = subscription => {
  switch (subscription) {
    case 'free':
      return ['email', 'clicks', 'username', 'created_at'];
      break;
    default:
      console.log('getAtrributes() default case');
      return ['email', 'clicks', 'username', 'created_at'];
  }
};

/**
 * getDataToUpdate
 *
 * Organizes the request's body into a Data Structure for
 * the database to interpret and update values in Campaign's
 * table.
 */
const getDataToUpdate = body => {
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
   * list[GET]
   * Adds a new email to our email list.
   */
  list(req, res) {
    // TODO: pagination (look at MLAB)[limit] & sorting[order](https://stackoverflow.com/questions/38211170/sequelize-pagination)
    // Handle order values from FE
    if (!(req.query && req.query.cid && req.query.limit)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    Entry.findAll({
      attributes: getAtrributes('free'), //getAtrributes(req.session.user.subscription)
      where: { campaign_id: req.query.cid },
      limit: req.query.limit,
      order: [['created_at', 'DESC']],
    })
      .then(entries => {
        console.log('entries', entries);
        return res.json({ entries, success: true, error: null });
      })
      .catch(error => {
        return res.json({
          error: 'Error getting entries',
          entries: null,
          success: false,
        });
      });
  },
  /**
   * create[POST]
   * Creates a new entry.
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
      .then(entry => {
        console.log('entries created!');
        console.timeEnd('Total Duration');
        return res.json({ success: true, error: null });
      })
      .catch(error => {
        console.log('Entry.create() error', error);
        return res.json({ error: 'Error saving entries.', success: false });
      });
  },
  /**
   * update[PUT]
   * Updates an entry.
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
      return res.json({ error: 'Missing fields(updatedData)', success: false });
    }
    entry
      .update(updatedData)
      .then(result => {
        return res.json({ success: true, error: null });
      })
      .catch(error => {
        console.log('entry.update() error', error);
        return res.json({
          error: 'Error updating this entry.',
          success: false,
        });
      });
  },
  /**
   * delete[DELETE]
   * Deletes an entry.
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
      .then(result => {
        console.log('entry deleted!');
        return res.json({ success: true, error: null });
      })
      .catch(error => {
        console.log('entry.destroy() error', error);
        return res.json({
          error: 'Error deleting entry, please contact support@puro.com',
          success: false,
        });
      });
  },
};
