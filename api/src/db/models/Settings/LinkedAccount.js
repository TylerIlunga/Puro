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
  let LinkedAccount = sequelize.define(
    'linked_account',
    {
      company: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      access_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      refresh_token: {
        type: Sequelize.BIGINT,
      },
      expiry_date: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
    },
    options,
  );

  LinkedAccount.associate = models => {};

  return LinkedAccount;
};
