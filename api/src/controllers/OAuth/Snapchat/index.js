const axios = require('axios');
const _crypto = require('crypto');
const uri = require('url');
const config = require('../config');

let account = {};

let OAUTH2_STATE_BYTES = 32;
let REGEX_PLUS_SIGN = /\+/g;
let REGEX_FORWARD_SLASH = /\//g;
let REGEX_EQUALS_SIGN = /=/g;

/*
 * This function generates a random amount of bytes using the
 * crypto library
 *
 * @param {int} size - The number of random bytes to generate.
 *
 * @returns {Buffer} The generated number of bytes
 */
const generateRandomBytes = function generateRandomBytes(size) {
  return _crypto.randomBytes(size);
};

/*
 * This function encodes the given byte buffer into a base64 URL
 * safe string.
 *
 * @param {Buffer} bytesToEncode - The bytes to encode
 *
 * @returns {string} The URL safe base64 encoded string
 */
const generateBase64UrlEncodedString = function generateBase64UrlEncodedString(
  bytesToEncode,
) {
  return bytesToEncode
    .toString('base64')
    .replace(REGEX_PLUS_SIGN, '-')
    .replace(REGEX_FORWARD_SLASH, '_')
    .replace(REGEX_EQUALS_SIGN, '');
};

/*
 * This function generates the state required for both the
 * OAuth2.0 Authorization and Implicit grant flow
 *
 * @returns {string} The URL safe base64 encoded string
 */
const generateClientState = (exports.generateClientState = function generateClientState() {
  return generateBase64UrlEncodedString(
    generateRandomBytes(OAUTH2_STATE_BYTES),
  );
});

const snapOAuthState = generateClientState();

module.exports = {
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      pid: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    const redirectLink = `https://accounts.snapchat.com/accounts/oauth2/auth?client_id=${config.snapchat.dev.client_id}&redirect_uri=${config.snapchat.redirect_uri}&response_type=code&scope=${config.snapchat.scope}&state=${snapOAuthState}`;
    res.redirect(redirectLink);
  },
  callback(req, res) {
    console.log('req.query:', req.query);
    if (!(req.query && req.query.state && req.query.state === snapOAuthState)) {
      console.log('invalid callback');
      // res.redirect(account.redirect_uri);
      return res.json({ fail: true });
    }

    const SNAPCHAT_AUTH_ENDPOINT =
      'https://accounts.snapchat.com/accounts/oauth2/token';
    const authorizationHeader =
      config.snapchat.dev.client_id + ':' + config.snapchat.dev.client_secret;
    const authorizationHeaderBase64 = Buffer.from(authorizationHeader).toString(
      'base64',
    );
    const body = `grant_type=authorization_code&client_id=${config.snapchat.dev.client_id}&redirect_uri=${config.snapchat.redirect_uri}&code=${req.query.code}`;
    const meta0 = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + authorizationHeaderBase64,
      },
    };
    axios
      .post(SNAPCHAT_AUTH_ENDPOINT, body, meta0)
      .then(response => {
        // Error Response Body
        // {
        //     error: <ascii error code>,
        //     error_description: <human readable error description>
        // }
        if (response.data.error) {
          throw response.data.error_description;
        }
        // Successful response
        // {
        //     access_token: <string>,
        //     refresh_token: <string>,
        //     expires_in: <time in seconds>
        // }
        const profileFields = ['id', 'displayName', 'bitmoji'];
        const profileUrl = 'https://kit.snapchat.com/v1/me';
        const parsedUri = uri.parse(profileUrl);
        // Choose the query based on the scopes passed in
        const query = `query=${encodeURIComponent(
          `{me{${profileFields.join(' ')}}}`,
        )}`;
        // Add the query to the existing search params if the uri already includes some
        parsedUri.search = parsedUri.search
          ? `${parsedUri.search}&${query}`
          : query;
        // Format the uri to be a string
        const url = String(uri.format(parsedUri));
        console.log('url', url);
        const body1 = `grant_type=code&client_id=${config.snapchat.dev.client_id}&client_secret=${config.snapchat.dev.client_secret}&access_token=${response.data.access_token}`;
        const meta1 = {
          headers: {
            Authorization: 'BEARER ' + response.data.access_token,
          },
        };
        axios
          .get(url, meta1)
          .then(profile => res.json({ profile }))
          .catch(err => {
            throw err;
          });
      })
      .catch(error => {
        console.log('axios.post(SNAPCHAT_AUTH_ENDPOINT error:', error);
        console.log('invalid callback');
        // res.redirect(account.redirect_uri);
        return res.json({ fail: true });
      });
  },
};
