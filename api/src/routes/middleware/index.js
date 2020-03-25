// NOTE: (SIDE PROJECT) Needs ALOT more security checks for a production environment.
const config = require('../../config');
module.exports = {
  /**
   * admin
   * Checks for admin key if admin calls are being made to the
   * API
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  admin(req, res, next) {
    if (!req.headers.admin_key) {
      return res.json({ error: 'Must provide an admin_key!' });
    }

    const adminKey = req.headers.admin_key.split('BEARER')[1].trim();
    if (adminKey !== config.ADMIN_KEY) {
      return res.json({ error: 'Invalid adminKey!' });
    }

    next();
  },
  /**
   * auth
   * Checks for requirements, such as a session and an auth key, before
   * hitting a requested endpoint.
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  auth(req, res, next) {
    console.log('auth() req.session', req.session);
    if (!req.session) {
      return res.json({ session: false });
    }

    console.log('headers', req.headers);
    if (!(req.headers.auth_key && req.headers.auth_key.indexOf('OHM') > -1)) {
      return res.json({ error: 'Missing key', success: false });
    }
    if (req.headers.auth_key.split(' ')[1] !== config.AUTH_KEY) {
      return res.json({ error: 'Invalid key', success: false });
    }

    next();
  },
  /**
   * keyCheck
   * Checks for required keys needed for endpoint calls.
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  keyCheck(req, res, next) {
    if (!req.headers.api_key) {
      return res.json({ error: 'Must provide an apiKey!' });
    }

    const apiKey = req.headers.api_key.split('BEARER')[1].trim();
    if (apiKey !== config.API_KEY) {
      return res.json({ error: 'Invalid apiKey!' });
    }

    next();
  },
};
