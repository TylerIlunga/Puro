/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./tools/Wimb
 *  Purpose       :  Module for "What Is My Browser"
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the helper methods utilizing "What Is My Browser"
 *                   Includes the following:
 *                   parseUserAgentData()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const axios = require('axios');
const { wimb } = require('../config');

/**
 * parseUserAgentData
 * Parses through the "User Agent" object for information
 * on the consumer visiting the Puro link.
 * @param {Object} user_agent
 */
const parseUserAgentData = user_agent => {
  if (!user_agent) return Promise.resolve({});
  return axios
    .post(
      `${wimb.base}/user_agent_parse`,
      { user_agent },
      { headers: wimb.auth_header },
    )
    .then(({ data }) => {
      const parsedData = data.parse;
      return parsedData;
    })
    .catch(err => {
      console.log(`user_agent parse network error()`, err.message);
      return {};
    });
};

module.exports = {
  parseUserAgentData,
};
