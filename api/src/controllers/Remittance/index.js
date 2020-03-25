/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Remittance
 *  Purpose       :  Module for the Remittance service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Remittance".
 *                   Includes the following:
 *                   review()
 *                   create()
 *                   update()
 *
 *  Notes         :  5
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
   * review[POST]
   * Gathers current user's remittance data, if the user
   * would like to view their Credit Card / Bank Account on file(Stripe).
   */
  async review(req, res) {
    if (!(req.body && req.body.password)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const user = await User.findOne({
      attributes: ['id', 'password'],
      where: { id: 1 }, //req.query.user_id
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
      console.log('User Remittance: ', remittance);
      stripe.customers.retrieve(remittance.sid, (error, customer) => {
        if (error) {
          console.log('stripe.customers.retrieve() error', error);
          return res.json({
            error: 'Error retrieving payment info.',
            success: false,
          });
        }
        console.log('stripe customer obj:', customer);
        // NOTE: should only have 1 source on file.
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
   * create[POST]
   * Creates a new stripe customer account on our end
   * for the current user and stores their customer id
   * for future remittance operations.
   */
  async create(req, res) {
    if (!(req.body && req.body.stripe_token)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    // NOTE: Make sure user exists
    // User should exist if program calls next() on auth middleware.
    const user = await User.findOne({ id: req.query.user_id });
    // const user = await User.findOne({ where: { id: 1 } });
    if (!user) console.log('NO USER: SHOULD NOT HAPPEN!');

    const remittance = await Remittance.findOne({
      attributes: ['id'],
      where: { user_id: user.id },
    });
    if (remittance) {
      console.log('User Remittance: ', remittance);
      return res.json({
        error: 'Banking account already exists.',
        success: false,
      });
    }

    // NOTE: Whenever you attach a card to a customer
    // Stripe will automatically validate the card.
    stripe.customers.create(
      {
        email: user.dataValues.email,
        description: `Creating Customer Object for ${user.dataValues.email}`,
        source: req.body.stripe_token,
      },
      (sErr, customer) => {
        if (sErr) {
          console.log('stripe.customers.create() sErr', sErr);
          return res.json({
            error: 'Error storing credit card info!',
            success: false,
          });
        }
        console.log('stripe.customers.create() customer', customer);
        Remittance.create({
          sid: customer.id,
          user_id: 1, // req.query.user_id
        })
          .then(remitt => {
            console.log('Remittance created and stored!', remitt);
            return res.json({ success: true, error: false });
          })
          .catch(error => {
            console.log('Remittance.create() error', error);
            return res.json({
              error: 'Error storing remittance id! Contact support@puro.com',
              success: false,
            });
          });
      },
    );
  },
  /**
   * update[PUT]
   * Updates remittance information both on our end and stripe's.
   */
  async update(req, res) {
    // NOTE: Handle Bank Accounts()
    if (!(req.body && req.body.stripe_token)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    // NOTE: Make sure user exists
    const user = await User.findOne({ id: req.query.user_id });
    // const user = await User.findOne({ where: { id: 1 } });
    if (!user) console.log('NO USER: SHOULD NOT HAPPEN!');

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

    stripe.customers.update(
      remittance.dataValues.sid,
      {
        source: req.body.stripe_token,
      },
      (sErr, customer) => {
        if (sErr) {
          console.log('stripe.customers.update() sErr', sErr);
          return res.json({
            error: 'Error updating credit card info!',
            success: false,
          });
        }
        console.log('success updating customer info!');
        return res.json({ success: true, error: false });
      },
    );
  },
};
