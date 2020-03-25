const { web_base } = require('../../config');
module.exports = user => {
  return `
    <a href="${web_base}/reset?token=${user.passwordResetToken}&email=${user.email}">
      Click here to change your password!
    </a>
    <br/><br/>
    <b>Puro Team</b>
  `;
};
