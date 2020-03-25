const axios = require('axios');
const { base } = require('../../config');
const CronJob = require('cron').CronJob;

const updateTimeStamps = async () => {
  console.log('/api/account/snapshot');
  axios
    .get(`${base}/api/snapshot/take`)
    .then(result => {
      console.log('updateTimeStamps() axios.get() result', result);
    })
    .catch(error => {
      console.log('updateTimeStamps() axios.get() error', error);
    });
};

const startSnapshotCronJob = () => {
  new CronJob({
    cronTime: '* * 2 * * *',
    timeZone: 'America/Los_Angeles',
    onTick: updateTimeStamps,
    onComplete: () => console.log('Snapshot job completed.'),
  }).start();
};

module.exports = {
  startSnapshotCronJob,
};
