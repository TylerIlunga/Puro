const Sequelize = require('sequelize');
const options = {
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeValidate(user, options) {},
    afterValidate(user, options) {},
    beforeCreate(user, options) {},
    afterCreate(user, options) {},
  },
};

module.exports = sequelize => {
  let Puro = sequelize.define(
    'puro',
    {
      tag: Sequelize.STRING,
      link: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Puro.associate = models => {
    Puro.hasOne(models.Company, {
      as: 'puro_company',
      foreignKey: 'puro_id',
    });
    Puro.hasOne(models.FacebookAnalysis, {
      as: 'puro_facebook_analysis',
      foreignKey: 'puro_id',
    });
    Puro.hasOne(models.GithubAnalysis, {
      as: 'puro_github_analysis',
      foreignKey: 'puro_id',
    });
    Puro.hasOne(models.GoogleAnalysis, {
      as: 'puro_google_analysis',
      foreignKey: 'puro_id',
    });
    Puro.hasOne(models.InstagramAnalysis, {
      as: 'puro_instagram_analysis',
      foreignKey: 'puro_id',
    });
    Puro.hasOne(models.SpotifyAnalysis, {
      as: 'puro_spotify_analysis',
      foreignKey: 'puro_id',
    });
    Puro.hasOne(models.TwitterAnalysis, {
      as: 'puro_twitter_analysis',
      foreignKey: 'puro_id',
    });
  };

  return Puro;
};
