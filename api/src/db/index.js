/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./db
 *  Purpose       :  Module for
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that initializes the database and
 *                   it's models for operations.
 *
 *  Notes         :  3
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const Sequelize = require('sequelize');
const { dbConfig } = require('./config');

//db should have a hash password for prod
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    password: dbConfig.password,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false, // NOTE: only "false" for testing
  },
);

const models = {
  Remittance: require('./models/Settings/Remittance')(sequelize),
  FacebookAnalysis: require('./models/Analysis/FacebookAnalysis')(sequelize),
  GithubAnalysis: require('./models/Analysis/GithubAnalysis')(sequelize),
  GoogleAnalysis: require('./models/Analysis/GoogleAnalysis')(sequelize),
  InstagramAnalysis: require('./models/Analysis/InstagramAnalysis')(sequelize),
  SpotifyAnalysis: require('./models/Analysis/SpotifyAnalysis')(sequelize),
  TwitterAnalysis: require('./models/Analysis/TwitterAnalysis')(sequelize),
  FormQuestions: require('./models/Forms/Questions')(sequelize),
  Form: require('./models/Forms/Form')(sequelize),
  Company: require('./models/General/Company')(sequelize),
  Puro: require('./models/General/Puro')(sequelize),
  Entry: require('./models/General/Entry')(sequelize),
  Campaign: require('./models/General/Campaign')(sequelize),
  LinkedAccount: require('./models/Settings/LinkedAccount')(sequelize),
  Issue: require('./models/General/Issue')(sequelize),
  Snapshot: require('./models/Snapshots/Snapshot')(sequelize),
  FacebookSnapshot: require('./models/Snapshots/FacebookSnapshot')(sequelize),
  GenericSnapshot: require('./models/Snapshots/GenericSnapshot')(sequelize),
  GithubSnapshot: require('./models/Snapshots/GithubSnapshot')(sequelize),
  GoogleSnapshot: require('./models/Snapshots/GoogleSnapshot')(sequelize),
  InstagramSnapshot: require('./models/Snapshots/InstagramSnapshot')(sequelize),
  SpotifySnapshot: require('./models/Snapshots/SpotifySnapshot')(sequelize),
  TwitterSnapshot: require('./models/Snapshots/TwitterSnapshot')(sequelize),
  User: require('./models/General/User')(sequelize),
  EmailList: require('./models/General/EmailList')(sequelize),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
  if (!process.env.PROD) {
    console.log(key);
  }
});

sequelize
  .sync()
  .then(async () => {
    console.log('Connected to DB');
  })
  .catch(error => {
    console.error('sequelize sync error:', error);
  });

module.exports = {
  ...models,
  getClient: () => sequelize,
};
