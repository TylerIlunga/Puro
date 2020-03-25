const Sequelize = require('sequelize');

module.exports = sequelize => {
  let Issue = sequelize.define(
    'issue',
    {
      ticket_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {},
  );
  Issue.associate = models => {};
  return Issue;
};
