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

//** Will change to log revelent information from the Google_Analysis Table */
module.exports = sequelize => {
  let GoogleSnapshot = sequelize.define(
    'google_snapshot' /** CHANGE */,
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

  GoogleSnapshot.associate = models => {
    GoogleSnapshot.hasMany(models.Snapshot, {
      as: 'google_snapshot_id',
      foreignKey: 'go_id',
    });
  };

  return GoogleSnapshot;
};
