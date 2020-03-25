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
  let Company = sequelize.define(
    'company',
    {
      name: {
        type: Sequelize.ENUM(
          'facebook',
          'instagram',
          'spotify',
          'google',
          'twitter',
          'github',
        ),
        allowNull: true,
        validate: {
          len: {
            args: [6, 9],
            msg: 'Invalid length for name type value!',
          },
        },
      },
      campaign_tag: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  Company.associate = models => {
    // Company.belongsToMany(models.Campaign, {as: 'company', through: 'user_dsps', foreignKey: 'dsp_id'});
    // Company.belongsToMany(models.Campaign, {as: 'company', foreignKey: 'company_id'});
  };

  return Company;
};
