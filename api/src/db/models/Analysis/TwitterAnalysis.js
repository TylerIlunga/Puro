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
  let TwitterAnalysis = sequelize.define(
    'twitter_analysis',
    {
      access_token: Sequelize.STRING,
      access_token_secret: Sequelize.STRING,
      name: Sequelize.STRING,
      screen_name: Sequelize.STRING,
      description: Sequelize.STRING,
      verified: Sequelize.BOOLEAN,
      protected: Sequelize.BOOLEAN,
      suspended: Sequelize.BOOLEAN,
      statuses_count: Sequelize.INTEGER,
      favourites_count: Sequelize.INTEGER,
      follow_request_sent: Sequelize.BOOLEAN,
      followers_count: Sequelize.INTEGER,
      following: Sequelize.BOOLEAN,
      friends_count: Sequelize.INTEGER,
      lang: Sequelize.STRING,
      location: Sequelize.STRING,
      account_creation_date: Sequelize.STRING,
      contributors_enabled: Sequelize.BOOLEAN,
      default_profile: Sequelize.BOOLEAN,
      default_profile_image: Sequelize.BOOLEAN,
      geo_enabled: Sequelize.BOOLEAN,
      has_extended_profile: Sequelize.BOOLEAN,
      is_translation_enabled: Sequelize.BOOLEAN,
      is_translator: Sequelize.BOOLEAN,
      listed_count: Sequelize.INTEGER,
      needs_phone_verification: Sequelize.BOOLEAN,
      notifications: Sequelize.BOOLEAN,
      profile_background_color: Sequelize.STRING,
      profile_background_tile: Sequelize.BOOLEAN,
      profile_link_color: Sequelize.STRING,
      profile_sidebar_border_color: Sequelize.STRING,
      profile_sidebar_fill_color: Sequelize.STRING,
      profile_text_color: Sequelize.STRING,
      profile_use_background_image: Sequelize.BOOLEAN,
      time_zone: Sequelize.STRING,
      translator_type: Sequelize.STRING,
      utc_offset: Sequelize.BIGINT,
      country_code: Sequelize.STRING,
      country_name: Sequelize.STRING,
      software_name: Sequelize.STRING,
      software_version: Sequelize.STRING,
      operating_system: Sequelize.STRING,
      link: Sequelize.STRING,
      url: Sequelize.STRING,
      description_url: Sequelize.STRING,
      profile_background_image_url: Sequelize.STRING,
      profile_background_image_url_https: Sequelize.STRING,
      profile_banner_url: Sequelize.STRING,
      profile_image_url: Sequelize.STRING,
      profile_image_url_https: Sequelize.STRING,
      ip: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  return TwitterAnalysis;
};
