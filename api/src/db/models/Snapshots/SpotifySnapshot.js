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

//** Will change to log revelent information from the Spotify_Analysis Table */
module.exports = sequelize => {
  let SpotifySnapshot = sequelize.define(
    'spotify_snapshot' /** CHANGE */,
    {
      campaigns: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      entries: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      clicks: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  SpotifySnapshot.associate = models => {
    SpotifySnapshot.hasMany(models.Snapshot, {
      as: 'spotify_snapshot_id',
      foreignKey: 'sp_id',
    });
  };

  return SpotifySnapshot;
};
