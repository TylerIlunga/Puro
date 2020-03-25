const Mailchimp = require('mailchimp-api-v3');
const mailchimpAuthToken =
  process.env.MAILCHIMP_AUTH_TOKEN || '3c717ab6988bef4221608095b4b6209b-us20';

module.exports = {
  MAILGUN_USER:
    process.env.MAILGUN_USER ||
    'postmaster@sandbox0857439581d64765917da23955d3b233.mailgun.org',
  MAILGUN_PASS:
    process.env.MAILGUN_PASS ||
    '04705f7d9c83ed9bcd196bdc3394d1ba-985b58f4-2f63e9c6',
  MAILGUN_TLS: {
    rejectUnauthorized: process.env.MAILGUN_TLS_REJECT_UNAUTH || false,
  },
  mailchimp: new Mailchimp(mailchimpAuthToken),
};
