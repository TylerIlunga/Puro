/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Remittance
 *  Purpose       :  Module for the Remittance service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-04-03
 *  Description   :  Module that holds all of the services for "Remittance" or Payment Management.
 *                   Includes the following:
 *                   review()
 *                   create()
 *                   update()
 *
 *  Notes         :  2
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const { stripeKey } = require('../../config');
const stripe = require('stripe')(stripeKey);
const bcrypt = require('bcrypt-nodejs');
const db = require('../../db');
const User = db.User;
const Remittance = db.Remittance;

module.exports = {
  /**
   * Gathers current user's remittance data, if the user
   * would like to view their Credit Card / Bank Account on file (Stripe).
   * @param {Object} req
   * @param {Object} res
   */
  async review(req, res) {
    if (!(req.query.user_id && req.body && req.body.password)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const user = await User.findOne({
      attributes: ['id', 'password'],
      where: { id: req.query.user_id },
    });
    if (!user) {
      return res.json({
        error: 'Account not on file! No should happen!',
        success: false,
      });
    }

    bcrypt.compare(req.body.password, user.password, async (error, isMatch) => {
      if (error) {
        console.log('bcrypt.compare() error', error);
        return res.json({ error, success: false });
      }
      if (!isMatch) {
        return res.json({ error: 'Invalid Password!', success: false });
      }

      const remittance = await Remittance.findOne({
        attributes: ['sid'],
        where: { user_id: user.id },
      });
      if (!remittance) {
        return res.json({
          error: 'Puro Stripe Account not created for user.',
          success: false,
        });
      }

      stripe.customers.retrieve(remittance.sid, (error, customer) => {
        if (error) {
          console.log('customers.retrieve() error', error);
          return res.json({
            error: 'Error retrieving payment info.',
            success: false,
          });
        }
        console.log('customer obj:', customer);
        // NOTE: User should have only have 1 source on file.
        return res.json({
          remittance_info: {
            type: customer.sources.data[0].object,
            brand: customer.sources.data[0].brand,
            last4: customer.sources.data[0].last4,
            name: customer.sources.data[0].name,
          },
          success: true,
          error: false,
        });
      });
    });
  },
  /**
   * Creates a new stripe customer account within our system
   * for the current user and stores their customer id
   * for future remittance operations.
   * @param {Object} req
   * @param {Object} res
   */
  async create(req, res) {
    if (!(req.query.user_id && req.body && req.body.stripe_token)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    const user = await User.findOne({ id: req.query.user_id });
    if (!user) {
      return res.json({
        error: 'User does not exist.',
        success: false,
      });
    }

    const remittance = await Remittance.findOne({
      attributes: ['id'],
      where: { user_id: user.id },
    });
    if (remittance) {
      return res.json({
        error:
          'An account for payments already exists. Do not need to create a new one.',
        success: false,
      });
    }

    // NOTE: Whenever you attach a card to a customer, Stripe will automatically validate the card.
    stripe.customers.create(
      {
        email: user.dataValues.email,
        description: `Creating Customer Object for ${user.dataValues.email}`,
        source: req.body.stripe_token,
      },
      (sErr, customer) => {
        if (sErr) {
          console.log('.customers.create() sErr', sErr);
          return res.json({
            error: 'Error storing credit card info!',
            success: false,
          });
        }
        Remittance.create({
          sid: customer.id,
          user_id: req.query.user_id,
        })
          .then((_) => res.json({ success: true, error: false }))
          .catch((error) => {
            console.log('.create() error', error);
            return res.json({
              error: 'Error storing remittance id! Contact support@puro.com',
              success: false,
            });
          });
      },
    );
  },
  /**
   * Updates payment information both within our system and stripe's system.
   * @param {Object} req
   * @param {Object} res
   */
  async update(req, res) {
    if (!(req.query.user_id && req.body && req.body.stripe_token)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    const user = await User.findOne({ id: req.query.user_id });
    if (!user) {
      return res.json({
        error: 'User does not exist.',
        success: false,
      });
    }

    const remittance = await Remittance.findOne({
      attributes: ['sid'],
      where: { user_id: user.id },
    });
    if (!remittance) {
      return res.json({
        error: 'Payment information does not exist.',
        success: false,
      });
    }

    stripe.customers.update(
      remittance.dataValues.sid,
      { source: req.body.stripe_token },
      (sErr, _) => {
        if (sErr) {
          console.log('.customers.update() sErr', sErr);
          return res.json({
            error: 'Error updating credit card info!',
            success: false,
          });
        }
        res.json({ success: true, error: false });
      },
    );
  },
};
