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

//** Will change to log revelent information from the Github_Analysis Table */
module.exports = sequelize => {
  let GithubSnapshot = sequelize.define(
    'github_snapshot' /** CHANGE */,
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

  GithubSnapshot.associate = models => {
    GithubSnapshot.hasMany(models.Snapshot, {
      as: 'github_snapshot_id',
      foreignKey: 'gh_id',
    });
  };

  return GithubSnapshot;
};
