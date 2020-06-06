// NOTE: (SIDE PROJECT) Needs ALOT more security checks for a production environment.
const config = require('../../config');
module.exports = {
  /**
   * Checks for admin key if admin calls are being made to the API.
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
   * Checks whether or not the user has authenticated via
   * analysis of stored session and user token.
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async auth(req, res, next) {
    console.log('auth() req.session', req.session);
    if (!req.session) {
      return res.json({ error: 'Missing session', success: false });
    }
    console.log('auth() req.headers', req.headers);
    if (
      !(
        req.headers.authorization &&
        req.headers.authorization.indexOf('BEARER') > -1
      )
    ) {
      return res.json({ error: 'Missing token', success: false });
    }
    const token = req.headers.authorization.split(' ')[1];
    console.log('token', token);
    try {
      const decoded = await jwt.verify(token, J_SECRET);
      if (Date.now() > decoded.exp * 1000) {
        return res.json({ success: false, error: 'Session expired.' });
      }
      return next();
    } catch (error) {
      console.log('auth() jwt.verify() error', error);
      return res.json({ error: 'Invalid token.', success: false });
    }
  },
  /**
   * Checks for API key.
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  keyCheck(req, res, next) {
    console.log('headers:', req.headers);
    if (!(req.headers.api_key && req.headers.api_key.indexOf('OHM') > -1)) {
      return res.json({ error: 'Missing key', success: false });
    }
    if (req.headers.api_key.split(' ')[1] !== config.API_KEY) {
      return res.json({ error: 'Invalid key', success: false });
    }
    next();
  },
};
