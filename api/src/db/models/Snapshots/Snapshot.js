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
  let Snapshot = sequelize.define(
    'snapshot',
    {
      type: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Snapshot.associate = models => {};

  return Snapshot;
};
