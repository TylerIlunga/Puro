/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Snapshot
 *  Purpose       :  Module for the Snapshot service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-04-04
 *  Description   :  Module that holds all of the services for "Snapshot" located within the site's dashboard.
 *                   Includes the following:
 *                   enableTFA()
 *                   verifyQrCode()
 *                   verifyBackupToken()
 *                   disableTFA()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const db = require('../../db');
const Campaign = db.Campaign;
const Entry = db.Entry;
const FacebookAnalysis = db.FacebookAnalysis;
const FacebookSnapshot = db.FacebookSnapshot;
const GenericSnapshot = db.GenericSnapshot;
const GithubAnalysis = db.GithubAnalysis;
const GithubSnapshot = db.GithubSnapshot;
const GoogleAnalysis = db.GoogleAnalysis;
const GoogleSnapshot = db.GoogleSnapshot;
const InstagramAnalysis = db.InstagramAnalysis;
const InstagramSnapshot = db.InstagramSnapshot;
const SpotifyAnalysis = db.SpotifyAnalysis;
const SpotifySnapshot = db.SpotifySnapshot;
const TwitterAnalysis = db.TwitterAnalysis;
const TwitterSnapshot = db.TwitterSnapshot;
const Snapshot = db.Snapshot;
const User = db.User;

/**
 * Accumulates the total amount of entries
 * and clicks that the given campaign has generated.
 * @param {Array[Object]} campaigns
 */
const accumulateTotals = (campaigns) => {
  return new Promise((resolve, reject) => {
    let clicks = 0;
    let entriesLength = 0;
    let promises = campaigns.map(async (campaign) => {
      return Entry.findAll({
        where: { campaign_id: campaign.dataValues.id },
      })
        .then((entries) => {
          if (entries) {
            entriesLength += entries.length;
            clicks += entries.reduce((sum, entry) => {
              return (sum += entry.dataValues.clicks);
            }, 0);
          }
        })
        .catch((error) => reject({ error }));
    });
    Promise.all(promises)
      .then((_) => {
        resolve({ clicks, entries: entriesLength, error: null });
      })
      .catch((error) => reject(error));
  });
};

/**
 * Accumulates the total amount of entries
 * and clicks that the given campaign has generated.
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherFacebookMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map((campaign) => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then((fbAnalysisRecords) => {
      // Note: Transformations, aggregations, and/or other
      // manipulations to the analysis data would occur here.
      return {
        campaigns: 96,
        entries: 96,
        clicks: 96,
      };
    })
    .catch((error) => {
      console.log('error fetching fbAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

/**
 * Gathers general metrics on all campaigns
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherGenericMetrics = async (user_id, campaigns) => {
  /** Campaigns, FBAnalysis, etc. snapshotss */
  if (campaigns) {
    const { error, clicks, entries } = await accumulateTotals(campaigns);
    if (error) {
      console.log('ERROR (returned from accumlateTotals):', error);
    }
    return {
      clicks,
      entries,
      user_id,
      campaigns: campaigns.length,
    };
  }
};

/**
 * Gathers stored Github metrics for each campaign.
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherGithubMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map((campaign) => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then((githubAnalysisRecords) => {
      // Note: Transformations, aggregations, and/or other
      // manipulations to the analysis data would occur here.
      return {
        campaigns: 96,
        entries: 96,
        clicks: 96,
      };
    })
    .catch((error) => {
      console.log('error fetching githubAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

/**
 * Gathers stored Google metrics for each campaign.
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherGoogleMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map((campaign) => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then((googleAnalysisRecords) => {
      // Note: Transformations, aggregations, and/or other
      // manipulations to the analysis data would occur here.
      return {
        campaigns: 96,
        entries: 96,
        clicks: 96,
      };
    })
    .catch((error) => {
      console.log('error fetching googleAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

/**
 * Gathers stored Instagram metrics for each campaign.
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherInstagramMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map((campaign) => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then((instagramAnalysisRecords) => {
      // Note: Transformations, aggregations, and/or other
      // manipulations to the analysis data would occur here.
      return {
        campaigns: 96,
        entries: 96,
        clicks: 96,
      };
    })
    .catch((error) => {
      console.log('error fetching instagramAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

/**
 * Gathers stored Spotify metrics for each campaign.
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherSpotifyMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map((campaign) => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then((spotifyAnalysisRecords) => {
      // Note: Transformations, aggregations, and/or other
      // manipulations to the analysis data would occur here.
      return {
        campaigns: 96,
        entries: 96,
        clicks: 96,
      };
    })
    .catch((error) => {
      console.log('error fetching spotifyAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

/**
 * Gathers stored Twitter metrics for each campaign.
 * @param {String} user_id
 * @param {Array[Object]} campaigns
 * @param {Object} analysisModel
 */
const gatherTwitterMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map((campaign) => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then((twitterAnalysisRecords) => {
      // Note: Transformations, aggregations, and/or other
      // manipulations to the analysis data would occur here.
      return {
        campaigns: 96,
        entries: 96,
        clicks: 96,
      };
    })
    .catch((error) => {
      console.log('error fetching spotifyAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

/**
 * Gathers metrics for each campaign.
 * @param {String} type
 * @param {Array[Object]} campaigns
 * @param {String} userId
 * @param {Object} analysisModel
 */
const gatherMetrics = async (type, campaigns, userId, analysisModel) => {
  let metrics = null;
  switch (type) {
    case 'facebook':
      metrics = await gatherFacebookMetrics(userId, campaigns, analysisModel);
      return metrics;
    case 'generic':
      metrics = await gatherGenericMetrics(userId, campaigns);
      return metrics;
    case 'github':
      metrics = await gatherGithubMetrics(userId, campaigns, analysisModel);
      return metrics;
    case 'google':
      metrics = await gatherGoogleMetrics(userId, campaigns, analysisModel);
      return metrics;
    case 'instagram':
      metrics = await gatherInstagramMetrics(userId, campaigns, analysisModel);
      return metrics;
    case 'spotify':
      metrics = await gatherSpotifyMetrics(userId, campaigns, analysisModel);
      return metrics;
    case 'twitter':
      metrics = await gatherTwitterMetrics(userId, campaigns, analysisModel);
      return metrics;
  }
};

/**
 * Persists individual snapshiot data for each metric
 * and stores the relational key in a generic Snapshot table.
 * @param {Object} promiseData
 * @return {Promise}
 */
const createSnapshotPromise = (promiseData) => {
  const snapshotModel = promiseData.model;
  return snapshotModel
    .create(promiseData.createData)
    .then((smResult) => {
      let snapshotCreateData = {
        type: promiseData.type,
        user_id: promiseData.userId,
      };
      snapshotCreateData[promiseData.company_id] = smResult.dataValues.id;
      return Snapshot.create(snapshotCreateData)
        .then((_) => {
          return {
            company: promiseData.type,
            user_id: promiseData.userId,
            success: true,
            error: null,
          };
        })
        .catch((error) => {
          console.log('createSnapshotPromise error: ', error);
          return {
            error,
            success: false,
            company: promiseData.type,
            user_id: promiseData.userId,
          };
        });
    })
    .catch((error) => {
      console.log('createSnapshotPromise error:', error);
      return {
        error,
        success: false,
        company: 'snapshotModel.create() error(therefore, no company name)',
        user_id: 'snapshotModel.create() error(therefore, no user_id)',
      };
    });
};

/**
 * Creates and gathers promises for each snapshot creation operation.
 * @param {Array[Object]} users
 * @return {Promise}
 */
const gatherPromises = async (users) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    users.map(async (user, index) => {
      /** For each user, first, gather and organize metrics */
      const userId = user.dataValues.id;
      const campaigns = await Campaign.findAll({
        attributes: ['id'],
        where: { user_id: userId },
      });
      if (campaigns) {
        const genericSnapshotData = await gatherMetrics(
          'generic',
          campaigns,
          userId,
          null,
        );
        const facebookSnapshotData = await gatherMetrics(
          'facebook',
          campaigns,
          userId,
          FacebookAnalysis,
        );
        const githubSnapshotData = await gatherMetrics(
          'github',
          campaigns,
          userId,
          GithubAnalysis,
        );
        const googleSnapshotData = await gatherMetrics(
          'google',
          campaigns,
          userId,
          GoogleAnalysis,
        );
        const instagramSnapshotData = await gatherMetrics(
          'instagram',
          campaigns,
          userId,
          InstagramAnalysis,
        );
        const spotifySnapshotData = await gatherMetrics(
          'spotify',
          campaigns,
          userId,
          SpotifyAnalysis,
        );
        const twitterSnapshotData = await gatherMetrics(
          'twitter',
          campaigns,
          userId,
          TwitterAnalysis,
        );

        /** Push promise to promises array for "parallel" execution of snapshot data storage */
        promises.push(
          await createSnapshotPromise({
            userId,
            model: FacebookSnapshot,
            createData: facebookSnapshotData,
            type: 'facebook',
            company_id: 'fb_id',
          }),
        );

        promises.push(
          await createSnapshotPromise({
            userId,
            model: GenericSnapshot,
            createData: genericSnapshotData,
            type: 'generic',
            company_id: 'gs_id',
          }),
        );

        promises.push(
          await createSnapshotPromise({
            userId,
            model: GithubSnapshot,
            createData: githubSnapshotData,
            type: 'github',
            company_id: 'gh_id',
          }),
        );

        promises.push(
          await createSnapshotPromise({
            userId,
            model: GoogleSnapshot,
            createData: googleSnapshotData,
            type: 'google',
            company_id: 'go_id',
          }),
        );

        promises.push(
          await createSnapshotPromise({
            userId,
            model: InstagramSnapshot,
            createData: instagramSnapshotData,
            type: 'instagram',
            company_id: 'ig_id',
          }),
        );

        promises.push(
          await createSnapshotPromise({
            userId,
            model: SpotifySnapshot,
            createData: spotifySnapshotData,
            type: 'spotify',
            company_id: 'sp_id',
          }),
        );

        promises.push(
          await createSnapshotPromise({
            userId,
            model: TwitterSnapshot,
            createData: twitterSnapshotData,
            type: 'twitter',
            company_id: 't_id',
          }),
        );
      }
      if (index === users.length - 1) {
        resolve(promises);
      }
    });
  });
};

module.exports = {
  /**
   * Takes a daily snapshot of the database for chronological reporting.
   * NOTE: As of 04-04-2020 I would take a different approach.
   * Data would be scattered across caches, OLTP databases, Kafka Brokers, etc.
   * Consumers would periodically poll the Kafka brokers to handle the snapshot operation and load the data
   * into a Data Warehouse (such as GCP BigQuery, AWS Redshift, etc.) or a Data Lake (GCP Cloud Storage, AWS S3, etc.)
   * @param {*} req
   * @param {*} res
   */
  async take(req, res) {
    try {
      const users = await User.findAll({ attributes: ['id'] });
      if (!users) {
        console.log('Failed to pull all users.');
        return res.json({ error: 'No users.', success: false });
      }

      const promises = await gatherPromises(users);
      const snapshotResults = await Promise.all(promises);

      console.log('snapshotResults:', snapshotResults);
      console.log('CRON JOB snapshot(take) completed.');

      res.json({ result, error: null });
    } catch (error) {
      console.log('snapshot.take():', error);
      console.log('CRON JOB snapshot(take) completed.');
      res.json({ error });
    }
  },
};
