/** Expired/Invalid Tokens (Side Project) */

module.exports = {
  // wimb = whatismybrowser
  wimb: {
    base: process.env.WIMB_BASE || 'https://api.whatismybrowser.com/api/v2',
    auth_header: {
      'X-API-KEY':
        process.env.WIMB_API_KEY || 'c4d05b800db68ddad72260efcdb1e53e',
    },
  },
};
