/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Analysis
 *  Purpose       :  Module for the Analysis service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   handleUpdatingMap()
 *                   getEntriesForCampaign()
 *                   getTopCompanies()
 *                   getHistoricalData()
 *                   collectUsernames()
 *                   collectEmails()
 *                   collectTotalClicks()
 *                   collectBasicAnalysisData()
 *                   organizeBasicAnalysisData()
 *                   handleBasicEntryDataGathering()
 *                   generateDataset()
 *                   handleSeedAnalysis()
 *                   general()
 *                   fetch()
 *                   export()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const csv = require('csv');
const { capitalizeFirstLetter, snakeToCamelCase } = require('../../config');
const {
  Generic,
  Facebook,
  Github,
  Google,
  Instagram,
  Spotify,
  Twitter,
} = require('./generators');
const db = require('../../db');
const Op = db.getClient().Op;
const Campaign = db.Campaign;
const Entry = db.Entry;
const GenericSnapshot = db.GenericSnapshot;
const Snapshot = db.Snapshot;
const analyticalOptions = {
  facebook: db.FacebookAnalysis,
  google: db.GoogleAnalysis,
  github: db.GithubAnalysis,
  instagram: db.InstagramAnalysis,
  spotify: db.SpotifyAnalysis,
  twitter: db.TwitterAnalysis,
};

/**
 * handleUpdatingMap
 * Purpose: Updates generic Map.
 * @param {Object} obj
 * @param {string} key
 * @return {Object}
 */
const handleUpdatingMap = (obj, key) => {
  obj[key] === undefined ? (obj[key] = 1) : obj[key]++;
  return obj;
};

/**
 * getEntriesForCampaign
 * Purpose: Updates generic Map.
 * @param {string} campaign_id
 * @return {Promise<[Object]>}
 */
const getEntriesForCampaign = campaign_id => {
  return Entry.findAll({
    attributes: ['id', 'email', 'username', 'clicks', 'campaign_id'],
    where: { campaign_id },
    order: [['clicks', 'DESC']],
  });
};

/**
 * getTopCompanies
 * Purpose: Gathers the top five companies from the
 * from the current user's campaigns.
 * @param {Object} campaign
 * @param {Object} topCompanies
 */
const getTopCompanies = (campaign, topCompanies) => {
  if (Object.keys(topCompanies).length > 4) {
    return;
  }
  //console.log(topCompanies[campaign.company]);
  handleUpdatingMap(topCompanies, campaign.company);
};

/**
 * getGenericSnapshots
 * Purpose: Gathers all Generic Snapshots for seed
 * plan accounts.
 * @param {Object} snapshot
 */
const getGenericSnapshots = snapshot => {
  return GenericSnapshot.findAll({
    where: { id: snapshot.dataValues.gs_id },
  })
    .then(gSnapshots => {
      // console.log('getHistoricalData() gSnapshots', gSnapshots);
      if (!gSnapshots) {
        return [];
      }
      return gSnapshots;
    })
    .catch(error => {
      console.log('getHistoricalData() GenericSnapshot.findAll() error', error);
      return [];
    });
};

/**
 * getHistoricalData
 * Purpose: Gathers all the current's user snapshots of previous
 * information logged. (Primarily totals for now.)
 * @param {string} userId
 * @return {Promise}
 */
const getHistoricalData = userId => {
  return Snapshot.findAll({
    where: {
      [Op.and]: [{ user_id: userId }, { type: 'generic' }],
    },
  })
    .then(async snapshots => {
      let promises = [];
      snapshots.map(snapshot => {
        promises.push(getGenericSnapshots(snapshot));
      });
      return Promise.all(promises)
        .then(results => {
          // console.log('results:', results);
          if (results.length === 0) {
            return [];
          }
          return results.map(gSnapshot => {
            gSnapshot = gSnapshot[0].dataValues;
            console.log('gSnapshot:', gSnapshot);
            return {
              campaigns: gSnapshot.campaigns,
              clicks: gSnapshot.clicks,
              entries: gSnapshot.entries,
              created_at: gSnapshot.created_at,
            };
          });
        })
        .catch(error => {
          throw error;
        });
    })
    .catch(error => {
      console.log('getHistoricalData() Snapshot.findAll() error', error);
      return [];
    });
};

/**
 * collectUsernames
 * Purpose: Collects the top usernames from the current
 * user's campaigns.
 * @param {[string]} usersname
 * @param {string} entryUsername
 * @return {[string]}
 */
const collectUsernames = (usernames, entryUsername) => {
  if (entryUsername === null || entryUsername === undefined) {
    return usernames;
  }
  let usernameMap = {};
  //console.log('entryUsername', entryUsername);
  if (usernames.length < 5) {
    usernames.push(handleUpdatingMap(usernameMap, entryUsername));
  }
  return usernames;
};

/**
 * collectEmails
 * Purpose: Collects the top emails from the current
 * user's campaigns.
 * @param {[string]} emails
 * @param {string} entryEmail
 * @return {[string]}
 */
const collectEmails = (emails, entryEmail) => {
  if (entryEmail === null || entryEmail === undefined) {
    return emails;
  }
  let emailsMap = {};
  // console.log('entryEmail', entryEmail);
  if (emails.length < 5) {
    emails.push(handleUpdatingMap(emailsMap, entryEmail));
  }
  return emails;
};

/**
 * collectTotalClicks
 * Purpose: Collects the total amount of clicks from
 * the current user's campaigns.
 * @param {Number} clicks
 * @param {Number} entryClickAmount
 * @return {Number}
 */
const collectTotalClicks = (clicks, entryClickAmount) => {
  clicks += entryClickAmount;
  return clicks;
};

/**
 * collectBasicAnalysisData
 * Purpose: Collects analytical data from a current entry
 * based on the company specified in the campaign.
 * @param {Object} entry
 * @param {[Object]} companies
 * @return {[Promise<[Object]>]}
 */
const collectBasicAnalysisData = (entry, companies) => {
  let promises = [];
  Object.keys(companies).forEach(company => {
    //  console.log('entry:::::', entry.id, entry.campaign_id);
    promises.push(
      analyticalOptions[company].findOne({
        where: {
          [Op.and]: [
            { campaign_id: entry.campaign_id },
            { entry_id: entry.id },
          ],
        },
      }),
    );
  });
  return promises;
};

/**
 * organizeBasicAnalysisData
 * Purpose: Organizes the gathered analytical data into
 * famailar data structures.
 * @param {Object} basicAnalysisData
 * @return {Object}
 */
const organizeBasicAnalysisData = basicAnalysisData => {
  let ipCount = 0;
  let countries = [];
  let countriesMap = {};
  let countryCodes = [];
  let countryCodesMap = {};
  let software = [];
  let softwareMap = {};
  let versions = [];
  let versionsMap = {};
  let operatingSystems = [];
  let operatingSystemsMap = {};

  basicAnalysisData.forEach(analysis => {
    if (analysis.country_name !== null) {
      countriesMap = handleUpdatingMap(countriesMap, analysis.country_name);
    }
    if (countryCodes.length < 5 && analysis.country_code !== null) {
      countryCodesMap = handleUpdatingMap(
        countryCodesMap,
        analysis.country_code,
      );
    }
    if (software.length < 5 && analysis.software_name !== null) {
      softwareMap = handleUpdatingMap(softwareMap, analysis.software_name);
    }
    if (versions.length < 5 && analysis.software_version !== null) {
      versionsMap = handleUpdatingMap(versionsMap, analysis.software_version);
    }
    if (operatingSystems.length < 5 && analysis.operating_system !== null) {
      operatingSystemsMap = handleUpdatingMap(
        operatingSystemsMap,
        analysis.operating_system,
      );
    }
    ipCount++;
  });

  countries.push(countriesMap);
  countryCodes.push(countryCodesMap);
  software.push(softwareMap);
  versions.push(versionsMap);
  operatingSystems.push(operatingSystemsMap);

  return {
    ipCount,
    countries,
    countryCodes,
    software,
    versions,
    operatingSystems,
  };
};

/**
 * handleBasicEntryDataGathering
 * Purpose: Gathers, organizes, and ships basic analytical data for
 * all entries that the current user obtains.
 * @param {[Object]} entries
 * @param {Array} companies
 */
const handleBasicEntryDataGathering = (entries, companies) => {
  return new Promise((resolve, reject) => {
    let clicks = 0;
    let usernames = [];
    let emails = [];
    let promises = [];
    let basicAnalysisData = [];
    entries.forEach(entry => {
      usernames = collectUsernames(usernames, entry.username);
      emails = collectEmails(emails, entry.email);
      clicks = collectTotalClicks(clicks, entry.clicks);
      promises = [...promises, ...collectBasicAnalysisData(entry, companies)];
    });
    Promise.all(promises)
      .then(results => {
        if (results.length > 0) {
          results.forEach(result => {
            // console.log('Promise.all() Promise.all', result);
            if (result !== null) basicAnalysisData.push(result);
          });
        }

        resolve({
          clicks,
          emails,
          usernames,
          ...organizeBasicAnalysisData(basicAnalysisData),
        });
      })
      .catch(error => {
        console.log(
          'collectBasicAnalysisData() Promise.all() rejected:',
          error,
        );
        reject(error);
      });
  });
};

/**
 * generateDataset
 * Purpose: Generates a dataset based on the type of data
 * structure passed as an argument.
 * @param {string} generator
 * @param {string} type
 * @param {Object} data
 * @return {Object}
 */
const generateDataset = (generator, type, data) => {
  // console.log(`distributeDatasetGeneration() generate${type}Dataset`);
  switch (generator) {
    case 'generic':
      return Generic[`generate${type}Dataset`]
        ? Generic[`generate${type}Dataset`](data)
        : null;
    case 'facebook':
      return Facebook[`generate${type}Dataset`]
        ? Facebook[`generate${type}Dataset`](data)
        : null;
    case 'github':
      return Github[`generate${type}Dataset`]
        ? Github[`generate${type}Dataset`](data, type)
        : null;
    case 'google':
      return Google[`generate${type}Dataset`]
        ? Google[`generate${type}Dataset`](data)
        : null;
    case 'instagram':
      return Instagram[`generate${type}Dataset`]
        ? Instagram[`generate${type}Dataset`](data)
        : null;
    case 'spotify':
      return Spotify[`generate${type}Dataset`]
        ? Spotify[`generate${type}Dataset`](data)
        : null;
    case 'twitter':
      return Twitter[`generate${type}Dataset`]
        ? Twitter[`generate${type}Dataset`](data)
        : null;
  }
  // return generator.charAt(0).toUpperCase()[`generate${type}Dataset`](data);
};

/**
 * handleSeedAnalysis
 * Purpose: Handles data gathering/analysis for user's
 * with only the "Seed" plan.
 * @param {string} userId
 * @param {[Object]} campaigns
 * @return {Promise<Object>}
 */
const handleSeedAnalysis = async (userId, campaigns) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    let topCompanies = {};
    campaigns.forEach(campaign => {
      promises.push(getEntriesForCampaign(campaign.dataValues.id));
      getTopCompanies(campaign.dataValues, topCompanies);
    });
    promises.push(getHistoricalData(userId));
    Promise.all(promises)
      .then(results => {
        // console.log('handleSeedAnalysis() Promise.all() resolve', results);
        if (results.length === 0) {
          return resolve([]);
        }
        const entries = results[0];
        const historicalData = results[results.length - 1];
        console.log('historicalData() pre', results);
        handleBasicEntryDataGathering(entries, topCompanies)
          .then(seedData => {
            resolve({
              'Historical Data': generateDataset(
                'generic',
                'HistoricalData',
                historicalData,
              ),
              'Total Entries': generateDataset(
                'generic',
                'Entries',
                entries.length,
              ),
              'Top Companies': generateDataset(
                'generic',
                'Companies',
                topCompanies,
              ),
              'Total Clicks': generateDataset(
                'generic',
                'Clicks',
                seedData.clicks,
              ),
              'Top Emails': generateDataset(
                'generic',
                'Emails',
                seedData.emails,
              ),
              'Top Usernames': generateDataset(
                'generic',
                'Usernames',
                seedData.usernames,
              ),
              'Total IP Count': generateDataset(
                'generic',
                'IPCount',
                seedData.ipCount,
              ),
              'Top Countries': generateDataset(
                'generic',
                'Countries',
                seedData.countries,
              ),
              'Top Country Codes': generateDataset(
                'generic',
                'CountryCodes',
                seedData.countryCodes,
              ),
              'Top Software': generateDataset(
                'generic',
                'Software',
                seedData.software,
              ),
              'Top Software Versions': generateDataset(
                'generic',
                'SoftwareVersions',
                seedData.versions,
              ),
              'Top Operating Systems': generateDataset(
                'generic',
                'OperatingSystems',
                seedData.operatingSystems,
              ),
            });
          })
          .catch(error => {
            throw error;
          });
      })
      .catch(error => {
        console.log('handleSeedAnalysis() Promise.all() rejection', error);
        reject(error);
      });
  });
};

/**
 * handlePremiumPlanGathering
 * @param {string} company
 * @param {Object} storedAnalysisRecord
 */
const handlePremiumPlanGathering = (company, storedAnalysisRecord) => {
  let setOfOrganizedDatasets = {};
  const sarKeys = Object.keys(storedAnalysisRecord);
  console.log('handlePremiumPlanGathering sarKeys: ', sarKeys);
  sarKeys.forEach(key => {
    const datasetToOrganize = storedAnalysisRecord[key];
    // console.log('sarKeys.forEach [key] before: ', key);
    key = capitalizeFirstLetter(snakeToCamelCase(key));
    // console.log('sarKeys.forEach [key] after: ', key);
    const dataset = generateDataset(company, key, datasetToOrganize);
    if (dataset) {
      setOfOrganizedDatasets[key] = dataset;
    }
  });
  return setOfOrganizedDatasets;
};

/**
 * handlePremiumAnalysis
 * @param {string} subscription
 * @param {string} company
 * @param {Object} storedAnalysis
 * @return {Promise}
 */
const handlePremiumAnalysis = (subscription, company, storedAnalysisRecord) => {
  console.log(
    'handlePremiumAnalysis() subscription, company, storedAnalysisRecord',
    subscription,
    company,
    storedAnalysisRecord,
  );
  return new Promise((resolve, reject) => {
    // 1) Gather additional data(TBA based on app review results)
    // 2) Handle promises if any
    // 3) Generate and organize datasets for graphical representation
    // on the client.
    // NOTE: all in {x: {...}, y: {...} } format for data charts.
    // 4) TBA
    switch (subscription) {
      case 'seed':
        return resolve([]);
      case 'standard':
      case 'scale':
        return resolve(
          handlePremiumPlanGathering(company, storedAnalysisRecord),
        );
    }
  });
};

/**
 * handleFinalResults
 * @param {Object} results
 * @return {Object}
 */
const handleFinalResults = results => {
  if (results.length === 0) {
    console.log('handleFinalResults results.length === 0');
    return results;
  }
  let finalResultsObject = {};
  let rKeys = Object.keys(results[0]);
  rKeys.forEach(key => {
    finalResultsObject[key] = [];
  });
  results.forEach(result => {
    rKeys.forEach(key => {
      if (result[key] !== null && result[key] !== undefined) {
        finalResultsObject[key].push(result[key]);
      }
    });
  });
  return finalResultsObject;
};

module.exports = {
  /**
   * general [GET]
   * @param {Object} req
   * @param {Object} res
   */
  general(req, res) {
    if (!(req.query && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    Campaign.findAll({
      attributes: ['id', 'company'],
      where: {
        user_id: req.query.uid,
      },
    })
      .then(campaigns => {
        // console.log('Campaign.findAll() campaigns', campaigns);
        // NOTE: If the user has no campaigns, then on the FE they should not be able
        // to issue a network request for generic analysis on 0 campaigns.
        handleSeedAnalysis(req.query.uid, campaigns)
          .then(results => {
            console.log(
              'general handleSeedAnalysis() Promise.all() resolved',
              results,
            );
            return res.json({ data: results });
          })
          .catch(error => {
            console.log('general Promise.all() error', error);
            return res.json({
              data: null,
              success: false,
              error: 'Error fetching analytics. Please contact support.',
            });
          });
      })
      .catch(error => {
        console.log('general Campaign.findAll() error', error);
        return res.json({
          data: null,
          success: false,
          error: 'Error fetching analytics. Please contact support.',
        });
      });
  },
  /**
   * fetch [GET]
   * @param {Object} req
   * @param {Object} res
   */
  fetch(req, res) {
    if (
      !(
        req.query &&
        req.query.cid &&
        req.query.company &&
        req.query.plan &&
        req.query.uid
      )
    ) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    let promises = [];
    Campaign.findAll({
      attributes: ['id', 'company'],
      where: {
        user_id: req.query.uid,
      },
    })
      .then(campaigns => {
        promises.push(handleSeedAnalysis(req.query.uid, campaigns));
        console.log(
          'analyticalOptions[req.query.company]',
          analyticalOptions[req.query.company],
        );
        // return res.json({ data: [] });
        analyticalOptions[req.query.company]
          .findAll({ where: { campaign_id: req.query.cid } })
          .then(records => {
            records.map(record => {
              console.log('analyticalOptions.findOne() record', record);
              promises.push(
                handlePremiumAnalysis(
                  req.query.plan,
                  req.query.company,
                  record.dataValues,
                ),
              );
            });
            Promise.all(promises)
              .then(results => {
                let dataset = { ...results[0] };
                let finalizedPremiumAnalysisResults = [];
                results.map((result, index) => {
                  if (index !== 0) {
                    finalizedPremiumAnalysisResults.push(result);
                  }
                });
                finalizedPremiumAnalysisResults = handleFinalResults(
                  finalizedPremiumAnalysisResults,
                );
                dataset = { ...dataset, ...finalizedPremiumAnalysisResults };
                console.log(
                  'analyticalOptions[req.query.company].findOne Promise.all(promises) dataset',
                  dataset,
                );
                return res.json({
                  data: dataset,
                  success: true,
                  error: false,
                });
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(error => {
            console.log('analyticalOptions.findOne() error', error);
            return res.json({
              data: null,
              success: false,
              error: 'Error fetching analytics. Please contact support.',
            });
          });
      })
      .catch(error => {
        console.log('general Campaign.findAll() error', error);
        return res.json({
          data: null,
          success: false,
          error: 'Error fetching analytics. Please contact support.',
        });
      });
  },
  /**
   * export [POST]
   * @param {Object} req
   * @param {Object} res
   */
  export(req, res) {
    // exporting reports(time series, graphical data[ordered pairs in two different columns])
  },
  /**
   * seed [GET]
   * @param {Object} req
   * @param {Object} res
   */
  seed(req, res) {
    if (
      !(
        req.query &&
        req.query.uid &&
        req.query.cid &&
        req.query.company &&
        req.body &&
        req.body.seedData
      )
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }
    analyticalOptions[req.query.company]
      .create(req.body.seedData)
      .then(result => res.json({ result }))
      .catch(error => res.json({ error }));
  },
};
