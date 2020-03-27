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
  indexes: [
    {
      unique: false,
      fields: ['ticket_id'],
    },
  ],
};

module.exports = sequelize => {
  let Issue = sequelize.define(
    'issue',
    {
      ticket_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    options,
  );
  Issue.associate = models => {};
  return Issue;
};
