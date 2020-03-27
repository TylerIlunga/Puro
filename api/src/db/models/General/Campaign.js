const Sequelize = require('sequelize');
const { base } = require('../../../config');
const options = {
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeValidate(campaign, options) {},
    afterValidate(campaign, options) {},
    beforeCreate(campaign, options) {},
    afterCreate(campaign, options) {
      const { id, pid, user_id, redirect_uri } = campaign.dataValues;
      campaign.update({
        link: `${base}/api/puro?c=${id}&p=${pid}&a=${user_id}&r=${redirect_uri}`,
      });
    },
  },
  indexes: [
    {
      unique: false,
      fields: ['pid'],
    },
  ],
};

// NOTE: only admins can update the link
module.exports = sequelize => {
  let Campaign = sequelize.define(
    'campaign',
    {
      title: Sequelize.STRING,
      avatar: Sequelize.STRING,
      company: Sequelize.STRING,
      redirect_uri: Sequelize.STRING,
      pid: Sequelize.STRING,
      link: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Campaign.associate = models => {
    Campaign.hasOne(models.Company, {
      as: 'campaign_company',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.Form, {
      as: 'campaign_form',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.Puro, {
      as: 'campaign_puro_link',
      foreignKey: 'campaign_id',
    });
    Campaign.hasMany(models.Entry, {
      as: 'campaign_entry',
      foreignKey: 'campaign_id',
      onDelete: 'CASCADE',
    });
    Campaign.hasOne(models.FacebookAnalysis, {
      as: 'campaign_facebook_analysis',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.GithubAnalysis, {
      as: 'campaign_github_analysis',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.GoogleAnalysis, {
      as: 'campaign_google_analysis',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.InstagramAnalysis, {
      as: 'campaign_instagram_analysis',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.SpotifyAnalysis, {
      as: 'campaign_spotify_analysis',
      foreignKey: 'campaign_id',
    });
    Campaign.hasOne(models.TwitterAnalysis, {
      as: 'campaign_twitter_analysis',
      foreignKey: 'campaign_id',
    });
  };

  return Campaign;
};
