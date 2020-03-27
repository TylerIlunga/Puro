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

// NOTE: Apache Cassandra or a service such as Amazon Redshift
// maybe better than using PostgreSQL for Snapshot storage.
module.exports = sequelize => {
  let GenericSnapshot = sequelize.define(
    'generic_snapshot',
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

  GenericSnapshot.associate = models => {
    GenericSnapshot.hasMany(models.Snapshot, {
      as: 'generic_snapshot_id',
      foreignKey: 'gs_id',
    });
  };

  return GenericSnapshot;
};
