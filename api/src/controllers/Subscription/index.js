/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Subscription
 *  Purpose       :  Module for the Subscription service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Subscription".
 *                   Includes the following:
 *                   getAmountFromPlan()
 *                   fetch()
 *                   create()
 *                   update()
 *                   cancel()
 *
 *  Notes         :  3
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const { stripeKey, subscriptions } = require('../../config');
const stripe = require('stripe')(stripeKey);
const db = require('../../db');
const User = db.User;
const Remittance = db.Remittance;
const subscriptionsTypes = Object.keys(subscriptions);

/**
 * getAmountFromPlan
 * @param {Number} plan
 */
const getAmountFromPlan = (plan) => {
  switch (plan) {
    case 'seed':
      return subscriptions.seed.rate; // $25
    case 'standard':
      return subscriptions.standard.rate; // $50
    case 'scale':
      return subscriptions.scale.rate; // $100
  }
};

// NOTE: Full-fleshed out project would handle generated coupons for discounts
// such as "SPRING25": 25% off of Standard Plan for the first 2 months or something like that.

module.exports = {
  /**
   * Fetches information from Stripe on the current user's subscription.
   * @param {Object} req
   * @param {Object} res
   */
  async fetch(req, res) {
    if (!(req.query && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const remittance = await Remittance.findOne({
      where: { user_id: req.query.uid },
    });
    if (!remittance) {
      return res.json({ error: 'No Stripe Account on file.', success: false });
    }
    if (!remittance.dataValues.sub_id) {
      return res.json({
        error: 'No subscription found on file.',
        success: false,
      });
    }

    stripe.subscriptions.retrieve(
      remittance.dataValues.sub_id,
      (error, subscription) => {
        if (error) {
          console.log('stripe.subscriptions.retrieve() error:', error);
          return res.json({
            error: 'Invalid Subscription ID. Contact support.',
            success: false,
          });
        }
        res.json({
          subscriptionDetails: {
            active: true,
            plan: subscription.metadata.plan
              ? subscription.metadata.plan
              : subscription.plan.metadata.plan,
          },
          success: true,
          error: false,
        });
      },
    );
  },
  /**
   * Creates a new subscription plan via Stripe for the current user.
   * @param {Object} req
   * @param {Object} res
   */
  async create(req, res) {
    if (!(req.query && req.query.plan && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    if (!subscriptionsTypes.includes(req.query.plan)) {
      return res.json({ error: 'Invalid subscription type.', success: false });
    }

    // if (req.session.user.subscription === req.query.plan) {
    //   return res.json({ error: "Subscription already active.", success: false });
    // }

    const user = await User.findOne({
      where: { id: req.query.uid },
    });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }

    const remittance = await Remittance.findOne({
      attributes: ['id', 'sid'],
      where: { user_id: user.dataValues.id },
    });
    if (!remittance) {
      return res.json({
        error: 'Puro Stripe Account not created for user.',
        success: false,
      });
    }

    stripe.plans.create(
      {
        amount: getAmountFromPlan(req.query.plan),
        interval: subscriptions.chargeInterval,
        product: { name: req.query.plan },
        currency: subscriptions.chargeCurrency,
        metadata: { plan: req.query.plan },
      },
      (pErr, plan) => {
        if (pErr) {
          console.log('stripe.plans.create() pErr', pErr);
          return res.json({
            error: 'Error creating subscription[plan]!',
            success: false,
          });
        }
        stripe.subscriptions.create(
          {
            customer: remittance.dataValues.sid,
            items: [{ plan: plan.id }],
            tax_percent: subscriptions.salesTax,
          },
          (sErr, subscription) => {
            if (sErr) {
              console.log('stripe.subscriptions.create() sErr', sErr);
              return res.json({
                error: 'Error creating subscription[create]!',
                success: false,
              });
            }
            Promise.all([
              remittance.update({ sub_id: subscription.id }),
              user.update({ subscription: req.query.plan }),
            ])
              .then((_) => {
                res.json({
                  subscriptionDetails: {
                    active: true,
                    plan: req.query.plan,
                  },
                  success: true,
                  error: false,
                });
              })
              .catch((error) => {
                console.log('Remittance and/or user update error:', error);
                res.json({
                  error:
                    'Error updating account, please contact support@puro.com',
                  success: false,
                });
              });
          },
        );
      },
    );
  },
  /**
   * Updates the current subscription plan on Stripe for the current user.
   * @param {Object} req
   * @param {Object} res
   */
  async update(req, res) {
    if (!(req.query && req.query.plan && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    if (!subscriptionsTypes.includes(req.query.plan)) {
      return res.json({ error: 'Invalid subscription type.', success: false });
    }

    const user = await User.findOne({ where: { id: req.query.uid } });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }

    const remittance = await Remittance.findOne({
      attributes: ['id', 'sub_id'],
      where: { user_id: user.dataValues.id },
    });
    if (!(remittance && remittance.sub_id)) {
      return res.json({ error: 'No subscription to update.', success: false });
    }

    stripe.plans.create(
      {
        amount: getAmountFromPlan(req.query.plan),
        interval: subscriptions.chargeInterval,
        product: { name: req.query.plan },
        currency: subscriptions.chargeCurrency,
      },
      (pErr, plan) => {
        if (pErr) {
          console.log('stripe.plans.create() pErr', pErr);
          return res.json({
            error: 'Error creating subscription[plan]!',
            success: false,
          });
        }

        stripe.subscriptions.update(
          remittance.sub_id,
          {
            items: [{ plan: plan.id }],
            tax_percent: subscriptions.salesTax,
            prorate: subscriptions.prorate,
            metadata: { plan: req.query.plan },
          },
          (sErr, subscription) => {
            if (sErr) {
              console.log('stripe.subscriptions.create() sErr', sErr);
              return res.json({
                error: 'Error creating subscription[create]!',
                success: false,
              });
            }
            Promise.all([
              remittance.update({ sub_id: subscription.id }),
              user.update({ subscription: req.query.plan }),
            ])
              .then((_) => {
                res.json({
                  subscriptionDetails: {
                    active: true,
                    plan: req.query.plan,
                  },
                  success: true,
                  error: false,
                });
              })
              .catch((error) => {
                console.log('Remittance and/or user update error:', error);
                res.json({
                  error:
                    'Error updating account, please contact support@puro.com',
                  success: false,
                });
              });
          },
        );
      },
    );
  },
  /**
   * Cancels the current subscription plan on Stripe for the current user.
   * @param {Object} req
   * @param {Object} res
   */
  async cancel(req, res) {
    if (!(req.query && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const user = await User.findOne({
      where: { id: req.query.uid },
    });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }

    const remittance = await Remittance.findOne({
      attributes: ['id', 'sub_id'],
      where: { user_id: req.query.uid },
    });
    if (!(remittance && remittance.sub_id)) {
      return res.json({ error: 'No subscription to delete.', success: false });
    }

    stripe.subscriptions.del(remittance.sub_id, (err, confirmation) => {
      if (err) {
        console.log('stripe.subscriptions.del() err', err);
        return res.json({
          error: 'Error canceling subscription.',
          success: false,
        });
      }
      console.log('User canceled their subscription :(');
      Promise.all([
        remittance.update({ sub_id: null }),
        user.update({ subscription: 'free' }),
      ])
        .then((_) => res.json({ success: true, error: false }))
        .catch((error) => {
          console.log('Remittance and/or user update error:', error);
          res.json({
            error: 'Error updating account, please contact support@puro.com',
            success: false,
          });
        });
    });
  },
};
