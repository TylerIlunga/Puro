/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./routes
 *  Purpose       :  Module for the API's endpoints.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the endpoints for the API.
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const router = require('express').Router();
const middleware = require('./middleware');
const authController = require('../controllers/Auth');
const accountController = require('../controllers/Account');
const campaignController = require('../controllers/Campaign');
const emailListController = require('../controllers/EmailList');
const puroController = require('../controllers/Puro');
const oauthController = require('../controllers/OAuth');
const entryController = require('../controllers/Entry');
const linkingController = require('../controllers/Linking');
const remittanceController = require('../controllers/Remittance');
const securityController = require('../controllers/Security');
const snapshotController = require('../controllers/Snapshot');
const subscriptionController = require('../controllers/Subscription');
const supportController = require('../controllers/Support');
const analysisController = require('../controllers/Analysis');

// NOTE:
// 1) If this was fully-fleshed out, I would partition each service (Service-Oriented Architecture)
// 1a) Kops + Terraform

// 2) Tasks that would can/could become blockers:[Apache Kafka]
// 2a) Puro Jobs queued if there's 10,000s of requests being handle by link clicks.
// 2b) Oauth2 callback jobs queued up

// 3) SNAPSHOTS would be ADMIN CRON JOBS.

/** Test **/
router.get('/api/ping', (req, res) => res.send('pong'));

/** Auth **/
router.post('/api/auth/signup', middleware.keyCheck, authController.signup);
router.get(
  '/api/auth/resendEmail',
  middleware.keyCheck,
  authController.resendEmail,
);
router.get(
  '/api/auth/verify',
  middleware.keyCheck,
  authController.verifyAccount,
);
router.post('/api/auth/login', middleware.keyCheck, authController.login);
router.get(
  '/api/auth/handleTFA',
  middleware.keyCheck,
  authController.handleTFA,
);
router.post(
  '/api/auth/forgot',
  middleware.keyCheck,
  authController.forgotPassword,
);
router.get(
  '/api/auth/reset',
  middleware.keyCheck,
  authController.verifyResetToken,
);
router.post(
  '/api/auth/reset',
  middleware.keyCheck,
  authController.resetPassword,
);
router.get(
  '/api/auth/logout',
  middleware.keyCheck,
  middleware.auth,
  authController.logout,
);
router.delete(
  '/api/auth/delete',
  middleware.keyCheck,
  middleware.auth,
  authController.deleteAccount,
);

/** Account **/
router.get(
  '/api/account/retrieve',
  middleware.keyCheck,
  accountController.retrieve,
);
router.get(
  '/api/account/verify',
  middleware.keyCheck,
  accountController.verify,
);
router.put(
  '/api/account/update',
  middleware.keyCheck,
  accountController.update,
);
router.put('/api/account/reset', middleware.keyCheck, accountController.reset);
router.get(
  '/api/account/snapshot',
  middleware.keyCheck,
  accountController.snapshot,
);

// FLOW
// 1) Create Campaign
// 2) Generate link
// 3) Send the account, the link to share

/** Campaign **/
router.get('/api/campaign/list', middleware.keyCheck, campaignController.list);
router.post(
  '/api/campaign/create',
  middleware.keyCheck,
  campaignController.create,
);
router.put(
  '/api/campaign/update',
  middleware.keyCheck,
  campaignController.update,
);
router.get(
  '/api/campaign/export',
  middleware.keyCheck,
  campaignController.export,
);
router.delete(
  '/api/campaign/delete',
  middleware.keyCheck,
  campaignController.delete,
);

/** Browser Data Harvest **/
router.get('/api/puro', puroController.analyze);
router.get('/api/puro/link', puroController.fetchLink);

/** Oauth **/
router.get('/api/oauth/facebook', oauthController.facebook.oauth);
router.get('/api/oauth/facebook/callback', oauthController.facebook.callback);
router.get('/api/oauth/github', oauthController.github.oauth);
router.get('/api/oauth/github/callback', oauthController.github.callback);
router.get('/api/oauth/google', oauthController.google.oauth);
router.get('/api/oauth/google/callback', oauthController.google.callback);
router.get('/api/oauth/instagram', oauthController.instagram.oauth);
router.get('/api/oauth/instagram/callback', oauthController.instagram.callback);
router.get('/api/oauth/mailchimp', oauthController.mailchimp.oauth);
router.get('/api/oauth/mailchimp/callback', oauthController.mailchimp.callback);
router.get('/api/oauth/snapchat', oauthController.snapchat.oauth);
router.get('/api/oauth/snapchat/callback', oauthController.snapchat.callback);
router.get('/api/oauth/spotify', oauthController.spotify.oauth);
router.get('/api/oauth/spotify/callback', oauthController.spotify.callback);
router.get('/api/oauth/twitter', oauthController.twitter.oauth);
router.get('/api/oauth/twitter/callback', oauthController.twitter.callback);

/** Linking */
router.get('/api/linking/info', middleware.keyCheck, linkingController.fetch);
router.get(
  '/api/linking/unlink',
  middleware.keyCheck,
  linkingController.unlink,
);

/** Entry **/
router.get('/api/entry/list', middleware.keyCheck, entryController.list);
router.put('/api/entry/update', middleware.keyCheck, entryController.update);
router.delete('/api/entry/delete', middleware.keyCheck, entryController.delete);

router.get('/api/entry/create', middleware.keyCheck, entryController.create); // Admin only.

/** Analytics **/
router.get(
  '/api/analysis/general',
  middleware.keyCheck,
  analysisController.general,
);
router.get(
  '/api/analysis/fetch',
  middleware.keyCheck,
  analysisController.fetch,
);
router.get('/api/analysis/seed', middleware.keyCheck, analysisController.seed);

/** Support **/
router.post(
  '/api/support/issue',
  middleware.keyCheck,
  supportController.submitIssue,
);

//** Remittance **/
router.post(
  '/api/remittance/review',
  middleware.keyCheck,
  remittanceController.review,
);
router.post(
  '/api/remittance/create',
  middleware.keyCheck,
  remittanceController.create,
);
router.put(
  '/api/remittance/update',
  middleware.keyCheck,
  remittanceController.update,
);

//** Security **/
router.get(
  '/api/security/enableTFA',
  middleware.keyCheck,
  securityController.enableTFA,
);
router.post(
  '/api/security/verifyQrCode',
  middleware.keyCheck,
  securityController.verifyQrCode,
);
router.post(
  '/api/security/verifyBackupToken',
  middleware.keyCheck,
  securityController.verifyBackupToken,
);
router.put(
  '/api/security/disableTFA',
  middleware.keyCheck,
  securityController.disableTFA,
);

/** Snapshots */
router.get('/api/snapshot/take', middleware.keyCheck, snapshotController.take);

/** Subscription **/
router.get(
  '/api/subscription/fetch',
  middleware.keyCheck,
  subscriptionController.fetch,
);
router.get(
  '/api/subscription/create',
  middleware.keyCheck,
  subscriptionController.create,
);
router.get(
  '/api/subscription/update',
  middleware.keyCheck,
  subscriptionController.update,
);
router.get(
  '/api/subscription/cancel',
  middleware.keyCheck,
  subscriptionController.cancel,
);

/** Email List **/
router.get('/api/email/add', middleware.keyCheck, emailListController.add);

module.exports = router;
