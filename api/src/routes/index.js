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

/** Auth **/
router.post('/api/auth/signup', authController.signup);
router.get('/api/auth/resendEmail', authController.resendEmail);
router.get('/api/auth/verify', authController.verifyAccount);
router.post('/api/auth/login', authController.login);
router.get('/api/auth/handleTFA', authController.handleTFA);
router.post('/api/auth/forgot', authController.forgotPassword);
router.get('/api/auth/reset', authController.verifyResetToken);
router.post('/api/auth/reset', authController.resetPassword);
router.get('/api/auth/logout', authController.logout);
router.delete('/api/auth/delete', authController.deleteAccount);

/** Account **/
router.get('/api/account/retrieve', accountController.retrieve);
router.get('/api/account/verify', accountController.verify);
router.put('/api/account/update', accountController.update);
router.put('/api/account/reset', accountController.reset);
router.get('/api/account/snapshot', accountController.snapshot);

// FLOW
// 1) Create Campaign
// 2) Generate link
// 3) Send the account, the link to share

/** Campaign **/
router.get('/api/campaign/list', campaignController.list);
router.post('/api/campaign/create', campaignController.create);
router.put('/api/campaign/update', campaignController.update);
router.get('/api/campaign/export', campaignController.export);
router.delete('/api/campaign/delete', campaignController.delete);

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
router.get('/api/linking/info', linkingController.fetch);
router.get('/api/linking/unlink', linkingController.unlink);

/** Entry **/
router.get('/api/entry/list', entryController.list);
router.put('/api/entry/update', entryController.update);
router.delete('/api/entry/delete', entryController.delete);

router.get('/api/entry/create', entryController.create); // Admin only.

/** Analytics **/
router.get('/api/analysis/general', analysisController.general);
router.get('/api/analysis/fetch', analysisController.fetch);
router.get('/api/analysis/seed', analysisController.seed);
router.post('/api/analysis/export', analysisController.export);

/** Support **/
router.post('/api/support/issue', supportController.submitIssue);

//** Remittance **/
router.post('/api/remittance/review', remittanceController.review);
router.post('/api/remittance/create', remittanceController.create);
router.put('/api/remittance/update', remittanceController.update);

//** Security **/
router.get('/api/security/enableTFA', securityController.enableTFA);
router.post('/api/security/verifyQrCode', securityController.verifyQrCode);
router.post(
  '/api/security/verifyBackupToken',
  securityController.verifyBackupToken,
);
router.put('/api/security/disableTFA', securityController.disableTFA);

/** Snapshots */
router.get('/api/snapshot/take', snapshotController.take);

/** Subscription **/
router.get('/api/subscription/fetch', subscriptionController.fetch);
router.get('/api/subscription/create', subscriptionController.create);
router.get('/api/subscription/update', subscriptionController.update);
router.get('/api/subscription/cancel', subscriptionController.cancel);

/** Email List **/
router.get('/api/email/add', emailListController.add);

/** Privacy Policy(Mock) */
router.get('/policy', (req, res) => res.render('policy'));

router.get('/api/test', (req, res) => res.sendStatus(200));

module.exports = router;
