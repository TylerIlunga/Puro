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

//** Persist revelent information from the Twitter_Analysis Table */
// NOTE: Apache Cassandra or a service such as Amazon Redshift
// maybe better than using PostgreSQL for Snapshot storage.
module.exports = sequelize => {
  let TwitterSnapshot = sequelize.define(
    'twitter_snapshot',
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
