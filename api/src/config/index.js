/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  config.js
 *  Purpose       :  General configuration for API
 *  Author        :  Tyler
 *  Date          :  2020-03-25
 *  Description   :  This module provides general configuration for the API.
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

module.exports = {
  ADMIN_KEY:
    process.env.ADMIN_KEY ||
    'mV75$zmbYWCExS1yBWQH4L&051Mxtz^&HPz4aQ7enhAMcpR3*C',
  API_KEY:
    process.env.API_KEY || '^E9NHbjjJLg8Y3FuO2C!$&2#j&lzWhYyTHFXEW46Mgqe5Ta5sB',
  base: process.env.SERVICE_BASE || 'https://e05c97bb.ngrok.io',
  jwt: {
    J_SECRET: process.env.JWT_SECRET || '#*@&*#@kjscdjk@(*#z',
  },
  port: process.env.PORT || 1111,
  session: {
    S_SECRET: process.env.SESSION_SECRET || 'dfkjsdbvakjdbnj',
  },
  stripeKey: process.env.STRIPE_KEY || 'sk_test_10AtRvNhtm1UD0jjoCD5mLS2',
  subscriptions: {
    chargeInterval: 'month',
    chargeCurrency: 'usd',
    prorate: true,
    salesTax: 7.25,
    seed: {
      rate: 2500, // $25
    },
    standard: {
      rate: 5000, // $50
    },
    scale: {
      rate: 10000, // $100
    },
  },
  web_base: process.env.WEB_BASE || 'http://localhost:3000',
};
