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

//** Will change to log revelent information from the Instagram_Analysis Table */
module.exports = sequelize => {
  let InstagramSnapshot = sequelize.define(
    'instagram_snapshot' /** CHANGE */,
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

  InstagramSnapshot.associate = models => {
    InstagramSnapshot.hasMany(models.Snapshot, {
      as: 'instagram_snapshot_id',
      foreignKey: 'ig_id',
    });
  };

  return InstagramSnapshot;
};
