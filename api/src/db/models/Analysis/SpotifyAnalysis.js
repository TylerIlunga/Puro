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
  let SpotifyAnalysis = sequelize.define(
    'spotify_analysis',
    {
      access_token: Sequelize.STRING,
      refresh_token: Sequelize.STRING,
      name: Sequelize.STRING,
      birthdate: Sequelize.STRING,
      country: Sequelize.STRING,
      profile: Sequelize.STRING,
      followers: Sequelize.INTEGER,
      product: Sequelize.STRING,
      premiumAccount: Sequelize.BOOLEAN,
      type: Sequelize.STRING,
      topArtist: Sequelize.STRING,
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

  return SpotifyAnalysis;
};
