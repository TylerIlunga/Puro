/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./server
 *  Purpose       :  Module for the server.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that initializes the server for the API
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// NOTE: require("dotenv").load() for command line operation
// of loading in environment variables for private files
const app = require('../../app');
const { port } = require('../config');
const { startSnapshotCronJob } = require('../tools');
app.listen(port, error => {
  if (error) return console.log(error);
  console.log(`listening on port ${port}`);
  startSnapshotCronJob();
});
