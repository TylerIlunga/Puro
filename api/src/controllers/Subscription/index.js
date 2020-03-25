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

const { stripeKey } = require('../../config');
const stripe = require('stripe')(stripeKey);
const db = require('../../db');
const User = db.User;
const Remittance = db.Remittance;
const subscriptionsTypes = ['seed', 'standard', 'scale'];

/**
 * getAmountFromPlan
 * @param {Number} plan
 */
const getAmountFromPlan = plan => {
  switch (plan) {
    case 'seed':
      return 2500; // $25
    case 'standard':
      return 5000; // $50
    case 'scale':
      return 10000; // $100
  }
};

// NOTE: Handle generated coupons
// (SPRING25: 25% off of Standard Plan for the first 2 months).

module.exports = {
  /**
   * fetch[GET]
   * Fetches current subscription information from Stripe for
   * the current user.
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
    console.log('remittance::::', remittance);
    if (!remittance.dataValues.sub_id) {
      return res.json({
        error: 'No subscription found on file.',
        success: false,
      });
    }
    const subId = remittance.dataValues.sub_id;
    stripe.subscriptions.retrieve(subId, (err, subscription) => {
      if (err) {
        return res.json({
          error: 'Invalid Subscription ID. Contact support.',
          success: false,
        });
      }
      console.log('subscription', subscription);
      return res.json({
        subscriptionDetails: {
          active: true,
          plan: subscription.metadata.plan
            ? subscription.metadata.plan
            : subscription.plan.metadata.plan,
        },
        success: true,
        error: false,
      });
    });
  },
  /**
   * create[GET]
   * Creates a new subscription plan on Stripe for the current
   * user.
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

    console.log('user::::', user);

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

    console.log('remittance::::', remittance);

    stripe.plans.create(
      {
        amount: getAmountFromPlan(req.query.plan),
        interval: 'month',
        product: { name: req.query.plan },
        currency: 'usd',
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
            tax_percent: 9.5,
          },
          (sErr, subscription) => {
            if (sErr) {
              console.log('stripe.subscriptions.create() sErr', sErr);
              return res.json({
                error: 'Error creating subscription[create]!',
                success: false,
              });
            }
            console.log('success updating customer info!');
            Promise.all([
              remittance.update({ sub_id: subscription.id }),
              user.update({ subscription: req.query.plan }),
            ])
              .then(result => {
                return res.json({
                  subscriptionDetails: {
                    active: true,
                    plan: req.query.plan,
                  },
                  success: true,
                  error: false,
                });
              })
              .catch(error => {
                return res.json({
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
   * update[GET]
   * Updates the current subscription plan on Stripe for the
   * current user.
   */
  async update(req, res) {
    if (!(req.query && req.query.plan && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    if (!subscriptionsTypes.includes(req.query.plan)) {
      return res.json({ error: 'Invalid subscription type.', success: false });
    }

    //req.query.uid
    const user = await User.findOne({ where: { id: 1 } });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }

    console.log('user::::', user);

    const remittance = await Remittance.findOne({
      attributes: ['id', 'sub_id'],
      where: { user_id: user.dataValues.id }, // req.query.uid
    });
    if (!(remittance && remittance.sub_id)) {
      return res.json({ error: 'No subscription to update.', success: false });
    }
    console.log('remittance::::', remittance);

    stripe.plans.create(
      {
        amount: getAmountFromPlan(req.query.plan),
        interval: 'month',
        product: { name: req.query.plan },
        currency: 'usd',
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
            tax_percent: 9.5,
            prorate: true, // NOTE: review
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
            console.log('success updating customer info!');
            console.log('update() subscription', subscription);
            Promise.all([
              remittance.update({ sub_id: subscription.id }),
              user.update({ subscription: req.query.plan }),
            ])
              .then(result => {
                return res.json({
                  subscriptionDetails: {
                    active: true,
                    plan: req.query.plan,
                  },
                  success: true,
                  error: false,
                });
              })
              .catch(error => {
                console.log('update() Promise.all error()', error);
                return res.json({
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
   * cancel[GET]
   * Cancels the current subscription plan on Stripe for
   * the current user.
   */
  async cancel(req, res) {
    if (!(req.query && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    const user = await User.findOne({
      where: { id: 1 }, //req.query.uid
    });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }
    // NOTE: user should only have one stripe account so use req.query.uid
    const remittance = await Remittance.findOne({
      attributes: ['id', 'sub_id'],
      where: { user_id: req.query.uid },
    });
    if (!(remittance && remittance.sub_id)) {
      return res.json({ error: 'No subscription to delete.', success: false });
    }

    console.log('remittance::::', remittance);

    stripe.subscriptions.del(remittance.sub_id, (err, confirmation) => {
      if (err) {
        console.log('stripe.subscriptions.del() err', err);
        return res.json({
          error: 'Error canceling subscription.',
          success: false,
        });
      }
      console.log('canceled subscription');
      Promise.all([
        remittance.update({ sub_id: null }),
        user.update({ subscription: 'free' }),
      ])
        .then(result => {
          return res.json({ success: true, error: false });
        })
        .catch(error => {
          return res.json({
            error: 'Error updating account, please contact support@puro.com',
            success: false,
          });
        });
    });
  },
};
