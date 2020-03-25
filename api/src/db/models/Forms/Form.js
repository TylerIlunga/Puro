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
  let Form = sequelize.define(
    'form',
    {
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      theme: {
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
  Form.associate = models => {
    Form.hasOne(models.FormQuestions, {
      as: 'form_questions',
      foreignKey: 'form_id',
    });
  };
  return Form;
};
