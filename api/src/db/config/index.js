/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./db/config
 *  Purpose       :  Module for
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module for database configuration settings and helper methods.
 *                   Includes the following:
 *                   dbConfig{}
 *                   genid()
 *                   genPassword()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const bcrypt = require('bcrypt-nodejs');
const uuidv4 = require('uuid/v4');

module.exports = {
  dbConfig: {
    user: process.env.PGUSER || 'tilios',
    host: process.env.PGHOST || 'postgres',
    password: process.env.PGPASS || 'thefirst',
    database: process.env.PGDATABASE || 'puro_dev',
    port: Number(process.env.PGPORT) || 5432,
    pool: {
      max: Number(process.env.PGPOOLMAX) || 5,
      min: Number(process.env.PGPOOLMIN) || 1,
      acquire: Number(process.env.PGPOOLACQUIREVAL) || 30000,
      idle: Number(process.env.PGPOOLIDLEVAL) || 10000,
    },
    dialect: process.env.PGDIALECT || 'postgres',
  },
  genid() {
    return uuidv4();
  },
  genPassword(password) {
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return reject(err);
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            return reject(err);
          }
          return resolve(hash);
        });
      });
    });
  },
};
