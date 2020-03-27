const Sequelize = require('sequelize');
const options = {
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeValidate(campaign, options) {},
    afterValidate(campaign, options) {},
    beforeCreate(campaign, options) {},
    afterCreate(campaign, options) {},
  },
};

// Data table feature structure:
// IDs ==> Tokens ==> Personal ==> Technical
module.exports = sequelize => {
  let GoogleAnalysis = sequelize.define(
    'google_analysis',
    {
      access_token: Sequelize.STRING,
      refresh_token: Sequelize.STRING,
      token_expiry_date: Sequelize.BIGINT,
      email: Sequelize.STRING,
      name: Sequelize.STRING,
      family_name: Sequelize.STRING,
      given_name: Sequelize.STRING,
      link: Sequelize.STRING,
      locale: Sequelize.STRING,
      picture: Sequelize.STRING,
      verified_email: Sequelize.BOOLEAN,
      countryCode: Sequelize.STRING,
      countryName: Sequelize.STRING,
      software_name: Sequelize.STRING,
      software_version: Sequelize.STRING,
      operating_system: Sequelize.STRING,
      ip: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  return GoogleAnalysis;
};
