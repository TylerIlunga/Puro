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
  let FacebookAnalysis = sequelize.define(
    'facebook_analysis',
    {
      access_token: Sequelize.STRING,
      refresh_token: Sequelize.STRING,
      country_code: Sequelize.STRING,
      country_name: Sequelize.STRING,
      software_name: Sequelize.STRING,
      software_version: Sequelize.STRING,
      operating_system: Sequelize.STRING,
      link: Sequelize.STRING,
      ip: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  return FacebookAnalysis;
};
