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

// NOTE: sid = stripe_id
module.exports = sequelize => {
  let Remittance = sequelize.define(
    'remittance',
    {
      sid: Sequelize.STRING,
      sub_id: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );
  Remittance.associate = models => {};
  return Remittance;
};
