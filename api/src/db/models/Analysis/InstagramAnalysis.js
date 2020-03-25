const Sequelize = require('sequelize');

//NOTE: different analysis tables per company?? probably

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
  let InstagramAnalysis = sequelize.define(
    'instagram_analysis',
    {
      full_name: Sequelize.STRING,
      bio: Sequelize.STRING,
      media: Sequelize.INTEGER,
      follows: Sequelize.INTEGER,
      followed_by: Sequelize.INTEGER,
      is_business: Sequelize.BOOLEAN,
      profile_picture: Sequelize.STRING,
      website: Sequelize.STRING,
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

  return InstagramAnalysis;
};
