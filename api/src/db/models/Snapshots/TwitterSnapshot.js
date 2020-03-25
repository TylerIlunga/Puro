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

//** Will change to log revelent information from the Twitter_Analysis Table */
module.exports = sequelize => {
  let TwitterSnapshot = sequelize.define(
    'twitter_snapshot' /** CHANGE */,
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

  TwitterSnapshot.associate = models => {
    TwitterSnapshot.hasMany(models.Snapshot, {
      as: 'twitter_snapshot_id',
      foreignKey: 't_id',
    });
  };

  return TwitterSnapshot;
};
