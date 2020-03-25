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

//** Tools for data gathering */

//** Generic */
const accumulateTotals = campaigns => {
  return new Promise((resolve, reject) => {
    let clicks = 0;
    let entriesLength = 0;
    let promises = campaigns.map(async campaign => {
      return Entry.findAll({
        where: { campaign_id: campaign.dataValues.id },
      })
        .then(entries => {
          console.log('entries.length', entries.length);
          if (entries) {
            entriesLength += entries.length;
            clicks += entries.reduce((sum, entry) => {
              return (sum += entry.dataValues.clicks);
            }, 0);
          }
        })
        .catch(error => reject({ error }));
    });
    Promise.all(promises)
      .then(result => {
        console.log('accumulateTotals() Promise.all result:', result);
        resolve({ clicks, entries: entriesLength, error: null });
      })
      .catch(error => reject(error));
  });
};

const gatherFacebookMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map(campaign => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then(fbAnalysisRecords => {
      console.log('[fb] analysis records', fbAnalysisRecords);
      return {
        campaigns: 69,
        entries: 69,
        clicks: 69,
      };
    })
    .catch(error => {
      console.log('error fetching fbAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

const gatherGenericMetrics = async (user_id, campaigns) => {
  /** Campaigns, FBAnalysis, etc. snapshotss */
  if (campaigns) {
    const { error, clicks, entries } = await accumulateTotals(campaigns);
    const gsData = {
      clicks,
      entries,
      user_id,
      campaigns: campaigns.length,
    };
    console.log('gsData', gsData);
    return gsData;
  }
};

const gatherGithubMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map(campaign => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then(githubAnalysisRecords => {
      console.log('[github] analysis records', githubAnalysisRecords);
      return {
        campaigns: 69,
        entries: 69,
        clicks: 69,
      };
    })
    .catch(error => {
      console.log('error fetching githubAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

const gatherGoogleMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map(campaign => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then(googleAnalysisRecords => {
      console.log('[google] analysis records', googleAnalysisRecords);
      return {
        campaigns: 69,
        entries: 69,
        clicks: 69,
      };
    })
    .catch(error => {
      console.log('error fetching googleAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

const gatherInstagramMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map(campaign => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then(instagramAnalysisRecords => {
      console.log('[ig] analysis records', instagramAnalysisRecords);
      return {
        campaigns: 69,
        entries: 69,
        clicks: 69,
      };
    })
    .catch(error => {
      console.log('error fetching instagramAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

const gatherSpotifyMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map(campaign => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then(spotifyAnalysisRecords => {
      console.log('[spotify] analysis records', spotifyAnalysisRecords);
      return {
        campaigns: 69,
        entries: 69,
        clicks: 69,
      };
    })
    .catch(error => {
      console.log('error fetching spotifyAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

const gatherTwitterMetrics = async (user_id, campaigns, analysisModel) => {
  let promises = [];
  campaigns.map(campaign => {
    promises.push(
      analysisModel.findAll({
        where: { campaign_id: campaign.dataValues.id },
      }),
    );
  });
  return Promise.all(promises)
    .then(twitterAnalysisRecords => {
      console.log('[twitter] analysis records', twitterAnalysisRecords);
      return {
        campaigns: 69,
        entries: 69,
        clicks: 69,
      };
    })
    .catch(error => {
      console.log('error fetching spotifyAnalysisRecords', error);
      return {
        campaigns: 404,
        entries: 404,
        clicks: 404,
      };
    });
};

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

const createSnapshotPromise = promiseData => {
  const snapshotModel = promiseData.model;
  return snapshotModel
    .create(promiseData.createData)
    .then(smResult => {
      let snapshotCreateData = {
        type: promiseData.type,
        user_id: promiseData.userId,
      };
      snapshotCreateData[promiseData.company_id] = smResult.dataValues.id;
      return Snapshot.create(snapshotCreateData)
        .then(result => {
          console.log('createSnapshotPromise() succeeded');
          return {
            company: promiseData.type,
            user_id: promiseData.userId,
            success: true,
            error: null,
          };
        })
        .catch(error => {
          console.log('createSnapshotPromise error: ', error);
          return {
            error,
            success: false,
            company: promiseData.type,
            user_id: promiseData.userId,
          };
        });
    })
    .catch(error => {
      console.log('createSnapshotPromise error:', error);
      return {
        error,
        success: false,
        company: 'snapshotModel.create() error(therefore, no company name)',
        user_id: 'snapshotModel.create() error(therefore, no user_id)',
      };
    });
};

const gatherPromises = async users => {
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
        console.log('campaigns', campaigns);
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

        /** Push promise to promises array for parallel execution of snapshot data storage */
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
   * take [GET] (ADMIN ONLY)
   * Purpose: Takes a daily snapshot of all the account data we have
   * for chronological reporting.
   * Step 1: pull all users
   * Step 2: accumulate totals, top emails(via # of clicks), and other important chronological metrics from each Company_Analysis
   * Step 3: Organize data for each type of snapshot(Facebook_Snapshot data column vales into an object, etc.)
   * Step 4: Push all Company_Snapshot.create(organizedData) + Snapshot.create({ id: ID of Company_Snapshot row recorded }) promises to an array
   * Step 5: Promise.all(promises) to parallel execution, handle errors, and record responses to a platform like UA for recording keeping
   * @param {*} req
   * @param {*} res
   */
  async take(req, res) {
    //** Pull all users */
    const users = await User.findAll({
      attributes: ['id'],
    });
    console.log('users:', users);
    if (!users) {
      console.log('Failed to pull all users.');
      return res.json({ error: 'No users.', success: false });
    }

    let promises = await gatherPromises(users);
    console.log('gatherPromises() promises', promises);
    Promise.all(promises)
      .then(result => {
        console.log('Promise.all result:', result);
        console.log('CRON JOB snapshot(take) completed.');
        res.json({ result, error: null });
      })
      .catch(error => {
        console.log('Promise.all error:', error);
        console.log('CRON JOB snapshot(take) completed.');
        res.json({ error });
      });
  },
};
