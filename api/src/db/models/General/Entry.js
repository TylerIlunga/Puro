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
  indexes: [
    {
      unique: false,
      fields: ['company_id'],
    },
  ],
};

module.exports = sequelize => {
  let Entry = sequelize.define(
    'entry',
    {
      company_id: Sequelize.STRING,
      username: Sequelize.STRING,
      email: Sequelize.STRING,
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Entry.associate = models => {
    Entry.hasOne(models.FacebookAnalysis, {
      as: 'entry_facebook_analysis',
      foreignKey: 'entry_id',
    });
    Entry.hasOne(models.GithubAnalysis, {
      as: 'entry_github_analysis',
      foreignKey: 'entry_id',
    });
    Entry.hasOne(models.GoogleAnalysis, {
      as: 'entry_google_analysis',
      foreignKey: 'entry_id',
    });
    Entry.hasOne(models.InstagramAnalysis, {
      as: 'entry_instagram_analysis',
      foreignKey: 'entry_id',
    });
    Entry.hasOne(models.SpotifyAnalysis, {
      as: 'entry_spotify_analysis',
      foreignKey: 'entry_id',
    });
    Entry.hasOne(models.TwitterAnalysis, {
      as: 'entry_twitter_analysis',
      foreignKey: 'entry_id',
    });
  };

  return Entry;
};
