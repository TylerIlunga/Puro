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
  let FormQuestions = sequelize.define(
    'form_questions',
    {
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      input_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );
  FormQuestions.associate = models => {};
  return FormQuestions;
};
