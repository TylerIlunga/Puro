const Sequelize = require('sequelize');
const options = {
  freezeTableName: true,
  timestamps: false,
  hooks: {
    beforeValidate(campaign, options) {},
    afterValidate(campaign, options) {},
    beforeCreate(campaign, options) {},
    afterCreate(campaign, options) {},
  },
};

// NOTE: Users can edit token scopes after the OAuth flow is completed.
// You should be aware of this possibility and adjust your application's
// behavior accordingly...

// Data table feature structure:
// IDs ==> Tokens ==> Personal ==> Technical
module.exports = sequelize => {
  let GithubAnalysis = sequelize.define(
    'github_analysis',
    {
      node_id: Sequelize.STRING,
      bio: Sequelize.STRING,
      blog: Sequelize.STRING,
      collaborators: Sequelize.INTEGER,
      company: Sequelize.STRING,
      email: Sequelize.STRING,
      followers: Sequelize.INTEGER,
      following: Sequelize.INTEGER,
      hireable: Sequelize.BOOLEAN,
      location: Sequelize.STRING,
      owned_private_repos: Sequelize.INTEGER,
      private_gists: Sequelize.INTEGER,
      public_gists: Sequelize.INTEGER,
      public_repos: Sequelize.INTEGER,
      site_admin: Sequelize.BOOLEAN,
      total_private_repos: Sequelize.INTEGER,
      two_factor_authentication: Sequelize.BOOLEAN,
      type: Sequelize.STRING,
      country_code: Sequelize.STRING,
      country_name: Sequelize.STRING,
      software_name: Sequelize.STRING,
      software_version: Sequelize.STRING,
      operating_system: Sequelize.STRING,
      url: Sequelize.STRING,
      html_url: Sequelize.STRING,
      link: Sequelize.STRING,
      avatar_url: Sequelize.STRING,
      ip: Sequelize.STRING,
      created_at: {
        type: Sequelize.BIGINT,
        defaultValue: Date.now(),
      },
    },
    options,
  );

  return GithubAnalysis;
};
