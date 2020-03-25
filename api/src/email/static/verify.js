const { base } = require('../../config');

module.exports = user => {
  let link = `${base}/api/account/verify?token=${user.accountResetToken}&email=${user.email}&business=${user.business}`;
  if (user.email && !user.business) {
    link = `${base}/api/account/verify?token=${user.accountResetToken}&email=${user.email}`;
  }
  if (!user.email && user.business) {
    link = `${base}/api/account/verify?token=${user.accountResetToken}&business=${user.business}`;
  }
  return `
    <a href="${link}">
      Click here to confirm your changes!
    </a>
    <br/><br/>
    <b>Puro Team</b>
  `;
};
