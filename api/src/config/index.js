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
  AUTH_KEY:
    process.env.AUTH_KEY ||
    '^vEmRnMjtwleB6knVWSV6*UODa4Z#A9XoVszaYs3ld5eFJW&oA',
  base: process.env.SERVICE_BASE || 'https://e05c97bb.ngrok.io',
  jwt: {
    J_SECRET: process.env.JWT_SECRET || '#*@&*#@kjscdjk@(*#z',
  },
  session: {
    S_SECRET: process.env.SESSION_SECRET || 'dfkjsdbvakjdbnj',
  },
  port: process.env.PORT || 1111,
  stripeKey: process.env.STRIPE_KEY || 'sk_test_10AtRvNhtm1UD0jjoCD5mLS2',
  web_base: process.env.WEB_BASE || 'http://localhost:3000',
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  snakeToCamelCase(text) {
    const result = text
      .replace(/([-_][a-z])/gi, newText => {
        return newText
          .toUpperCase()
          .replace('-', '')
          .replace('_', '');
      })
      .replace(/_/, '');
    return result;
  },
};
