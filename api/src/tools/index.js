/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./tools
 *  Purpose       :  Module for helper tools(primarily analytical tools)
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the tools needed throughout
 *                   the API.
 *                   Includes the following:
 *                   analyzeIp()
 *                   gatherWimbAnalytics()
 *                   storeFacebookData()
 *                   storeGoogleData()
 *                   storeGithubData()
 *                   storeInstagramData()
 *                   storeSpotifyData()
 *                   storeTwitterData()
 *                   storeAnalysis()
 *                   gatherAnalytics()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const ip2countrify = require('ip2countrify');
const { startSnapshotCronJob } = require('./Cron');
const Wimb = require('./Wimb');
const db = require('../db');
const FacebookAnalysis = db.FacebookAnalysis;
const GoogleAnalysis = db.GoogleAnalysis;
const GithubAnalysis = db.GithubAnalysis;
const InstagramAnalysis = db.InstagramAnalysis;
const SpotifyAnalysis = db.SpotifyAnalysis;
const TwitterAnalysis = db.TwitterAnalysis;

/**
 * analyzeIP
 * Gathers information from the consumer's ip address.
 * @param {string} clientIp
 * @return {Promise}
 */
const analyzeIP = (clientIp) => {
  console.log('analyzeIP()');
  return new Promise((resolve, reject) => {
    ip2countrify.lookup(clientIp, (ip, results, error) => {
      if (!error) {
        return resolve(results);
      }
      console.log('analyzeIP() error', error);
      return reject(error);
    });
  });
};

/**
 * gatherWimbAnalytics
 * Gathers and organizes consumer data after processing and analysis
 * by "What is my browser"
 * @param {Object} req
 * @return {Promise}
 */
const gatherWimbAnalytics = async (req) => {
  console.log('gatherWimbAnalytics()');
  return new Promise(async (resolve, reject) => {
    const wimbData = await Wimb.parseUserAgentData(req.headers['user-agent']);
    resolve({
      ...wimbData,
      ips: req.ips ? req.ips : null,
      host: req.headers.host,
    });
  });
};

/**
 * storeFacebookData
 * Organizes the consumer's Facebook data for data storage.
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeFacebookData = (analyticalLog) => {
  console.log('storeFacebookData()', analyticalLog);
  return FacebookAnalysis.create({
    access_token: analyticalLog.access_token,
    refresh_token: analyticalLog.refresh_token,
    country_code: analyticalLog.countryCode,
    country_name: analyticalLog.countryName,
    software_name: analyticalLog.software_name,
    software_version: analyticalLog.software_version,
    operating_system: analyticalLog.operating_system,
    ip: analyticalLog.ip,
    puro_id: analyticalLog.puro_id,
    entry_id: analyticalLog.entry_id,
    campaign_id: analyticalLog.campaign_id,
    link: analyticalLog.link,
  })
    .then((analysis) => {
      console.log('success saving analysis', analysis);
    })
    .catch((error) => {
      console.log('error saving analysis', error);
    });
};

/**
 * storeGoogleData
 * Organizes the consumer's Google data for data storage.
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeGoogleData = (analyticalLog) => {
  console.log('storeGoogleData()');
  return GoogleAnalysis.create({
    email: analyticalLog.email,
    family_name: analyticalLog.family_name,
    given_name: analyticalLog.given_name,
    cid: analyticalLog.id,
    link: analyticalLog.link,
    locale: analyticalLog.locale,
    name: analyticalLog.name,
    picture: analyticalLog.picture,
    verified_email: analyticalLog.verified_email,
    country_code: analyticalLog.countryCode,
    country_name: analyticalLog.countryName,
    software_name: analyticalLog.software_name,
    software_version: analyticalLog.software_version,
    operating_system: analyticalLog.operating_system,
    ip: analyticalLog.ip,
    puro_id: analyticalLog.puro_id,
    entry_id: analyticalLog.entry_id,
    campaign_id: analyticalLog.campaign_id,
    link: analyticalLog.link,
  })
    .then((analysis) => {
      console.log('success saving analysis', analysis);
    })
    .catch((error) => {
      console.log('error saving analysis', error);
    });
};

/**
 * storeGithubData
 * Organizes the consumer's Github data for data storage.
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeGithubData = (analyticalLog) => {
  console.log('storeGithubData()');
  return GithubAnalysis.create({
    avatar_url: analyticalLog.avatar_url,
    bio: analyticalLog.bio,
    blog: analyticalLog.blog,
    collaborators: analyticalLog.collaborators,
    company: analyticalLog.company,
    email: analyticalLog.email,
    followers: analyticalLog.followers,
    following: analyticalLog.following,
    hireable: analyticalLog.hireable,
    html_url: analyticalLog.html_url,
    location: analyticalLog.location,
    node_id: analyticalLog.node_id,
    owned_private_repos: analyticalLog.owned_private_repos,
    private_gists: analyticalLog.private_gists,
    public_gists: analyticalLog.public_gists,
    public_repos: analyticalLog.public_repos,
    site_admin: analyticalLog.site_admin,
    total_private_repos: analyticalLog.total_private_repos,
    two_factor_authentication: analyticalLog.two_factor_authentication,
    type: analyticalLog.type,
    url: analyticalLog.url,
    ip: analyticalLog.ip,
    puro_id: analyticalLog.puro_id,
    entry_id: analyticalLog.entry_id,
    campaign_id: analyticalLog.campaign_id,
    link: analyticalLog.link,
    country_code: analyticalLog.countryCode,
    country_name: analyticalLog.countryName,
    software_name: analyticalLog.software_name,
    software_version: analyticalLog.software_version,
    operating_system: analyticalLog.operating_system,
  })
    .then((analysis) => {
      console.log('success saving analysis', analysis);
    })
    .catch((error) => {
      console.log('error saving analysis', error);
    });
};

/**
 * storeInstagramData
 * Organizes the consumer's Instagram data for data storage.
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeInstagramData = (analyticalLog) => {
  console.log('storeInstagramData()');
  return InstagramAnalysis.create({ ...analyticalLog })
    .then((analysis) => {
      console.log('success saving analysis', analysis);
    })
    .catch((error) => {
      console.log('error saving analysis', error);
    });
};

/**
 * storeSpotifyData
 * Organizes the consumer's Spotify data for data storage.
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeSpotifyData = (analyticalLog) => {
  console.log('storeSpotifyData()');
  return SpotifyAnalysis.create({ ...analyticalLog })
    .then((analysis) => {
      console.log('success saving analysis', analysis);
    })
    .catch((error) => {
      console.log('error saving analysis', error);
    });
};

/**
 * storeTwitterData
 * Organizes the consumer's Twitter data for data storage.
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeTwitterData = (analyticalLog) => {
  console.log('storeTwitterData()');
  return TwitterAnalysis.create({ ...analyticalLog })
    .then((analysis) => {
      console.log('success saving analysis', analysis);
    })
    .catch((error) => {
      console.log('error saving analysis', error);
    });
};

/**
 * storeAnalysis
 * Delegates where the consumer's data should be transported
 * to, based on the specified company, for organization
 * before data storage.
 * @param {String} company
 * @param {Object} analyticalLog
 * @return {Promise}
 */
const storeAnalysis = (company, analyticalLog) => {
  console.log('storeAnalysis()');
  switch (company) {
    case 'facebook':
      return storeFacebookData(analyticalLog);
    case 'google':
      return storeGoogleData(analyticalLog);
    case 'github':
      return storeGithubData(analyticalLog);
    case 'instagram':
      return storeInstagramData(analyticalLog);
    case 'spotify':
      return storeSpotifyData(analyticalLog);
    case 'twitter':
      return storeTwitterData(analyticalLog);
  }
};

/**
 * gatherAnalytics
 * Manages the overall analysis of the consumer who visits
 * a Puro managed link by processing each analytical procedure
 * and storing it's results to our database(s).
 * @param {Object} req
 * @param {Object} account
 * @param {String} company
 * @param {Object} oauthData
 */
const gatherAnalytics = (req, account, company, oauthData) => {
  console.log('gatherAnalytics():', oauthData);
  Promise.all([analyzeIP(req.ip), gatherWimbAnalytics(req)])
    .then((pAllResult) => {
      const analyticalLog = {
        ...oauthData,
        ...pAllResult[0],
        ...pAllResult[1],
        campaign_id: account.campaign_id,
        entry_id: account.entry_id,
        puro_id: account.puro_id,
        ip: req.ip,
        link: account.redirect_uri,
      };
      storeAnalysis(company, analyticalLog);
    })
    .catch((error) => {
      console.log('Promise.all([]) error', error);
    });
};

module.exports = {
  analyzeIP,
  gatherWimbAnalytics,
  storeAnalysis,
  gatherAnalytics,
  startSnapshotCronJob,
};
