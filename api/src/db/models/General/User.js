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
  let User = sequelize.define(
    'users',
    {
      type: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user',
        validate: {
          len: {
            args: [4, 5],
            msg: 'Invalid length for user type value!',
          },
        },
      },
      email: { type: Sequelize.STRING },
      business: { type: Sequelize.STRING },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      activation_token: Sequelize.STRING,
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      subscription: {
        type: Sequelize.ENUM('free', 'seed', 'standard', 'scale'),
        defaultValue: 'free',
        validate: {
          len: {
            args: [4, 8],
            msg: 'Invalid length for subscription type value!',
          },
        },
      },
      trial_expires: {
        type: Sequelize.BIGINT,
      },
      password_reset_token: {
        type: Sequelize.STRING,
      },
      password_reset_expires: {
        type: Sequelize.BIGINT,
      },
      account_reset_token: {
        type: Sequelize.STRING,
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      two_factor_secret: {
        type: Sequelize.STRING,
      },
      two_factor_backup: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  User.associate = models => {
    User.hasMany(models.Campaign, {
      as: 'user',
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
    User.hasMany(models.Issue, { as: 'user_issue', foreignKey: 'user_id' });
    User.hasMany(models.LinkedAccount, {
      as: 'user_linked_accounts',
      foreignKey: 'user_id',
    });
    User.hasOne(models.Remittance, {
      as: 'user_remittance',
      foreignKey: 'user_id',
    });
    User.hasMany(models.Snapshot, {
      as: 'user_snapshot',
      foreignKey: 'user_id',
    });
    // User.hasMany(models.Message, { as: 'sender', foreignKey: 'sender_id', onDelete: 'CASCADE' });
    // User.belongsToMany(models.Fondue, {as: "collabRequests", foreignKey: "recipient_id", through: models.CollabRequests});
  };

  return User;
};
