/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Security
 *  Purpose       :  Module for the Security service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-04-03
 *  Description   :  Module that holds all of the services for "Security" located within the site's dashboard.
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

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../../db');
const User = db.User;

let tfaMap = {};

module.exports = {
  /**
   * Commences the TFA enabling process by generating and sending out
   * the QR Code needed for apps like Google Authenticator and backup token
   * in case they can not authenticate via Google Authenticator after enabling TFA.
   * @param {Object} req
   * @param {Object} res
   */
  enableTFA(req, res) {
    if (!(req.query && req.query.email)) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const secret = speakeasy.generateSecretASCII();
    const backupToken = crypto
      .createHash('sha1')
      .update(secret)
      .digest('base64');

    tfaMap.secret = secret;
    tfaMap.backupToken = backupToken;

    const otpauth_url = speakeasy.otpauthURL({
      secret,
      label: req.query.email,
      issuer: 'Puro',
    });

    QRCode.toDataURL(otpauth_url, (err, dataUrl) => {
      if (err) {
        return res.json({
          error: 'Generating data url for QR Code.',
          success: false,
        });
      }
      return res.json({
        backupToken,
        QRCodeImageUrl: dataUrl,
        error: false,
      });
    });
  },
  /**
   * Verifies whether or not the user scanned the QR
   * Code generated above and provided the correct token generated
   * via apps like Google Authenticator. If valid, enable TFA for the current user's account.
   * @param {Object} req
   * @param {Object} res
   */
  async verifyQrCode(req, res) {
    if (
      !(
        req.query &&
        req.query.uid &&
        req.body &&
        req.body.token &&
        req.body.backupToken
      )
    ) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const isValidToken = speakeasy.totp.verify({
      secret: tfaMap.secret,
      encoding: 'ascii',
      token: req.body.token,
    });
    const isValidBackupToken = tfaMap.backupToken === req.body.backupToken;
    if (!isValidToken || !isValidBackupToken) {
      return res.json({ error: 'Invalid token.', success: false });
    }

    const user = await User.findOne({
      attributes: ['id', 'two_factor_enabled'],
      where: { id: req.query.uid },
    });
    if (!user) {
      return res.json({ error: 'User does not exist.', success: false });
    }
    if (user.dataValues.two_factor_enabled) {
      return res.json({ error: 'TFA is already enabled.', success: false });
    }

    user
      .update({
        two_factor_enabled: true,
        two_factor_secret: tfaMap.secret,
        two_factor_backup: tfaMap.backupToken,
      })
      .then((_) => {
        tfaMap.secret = null;
        tfaMap.backupToken = null;
        delete tfaMap.secret;
        delete tfaMap.backupToken;
        tfaMap = null;
        res.json({ success: true, error: false });
      })
      .catch((error) => {
        console.log('.update() error', error);
        res.json({ error: 'Error updating user data:', success: false });
      });
  },
  /**
   * Verifies the supplied backup token from enableTFA(). For users that
   * can not access apps like the Google Authenticator app but they remember their backup token.
   * @param {Object} req
   * @param {Object} res
   */
  async verifyBackupToken(req, res) {
    if (
      !(
        req.query &&
        req.query.uid &&
        req.body &&
        req.body.backupToken &&
        req.body.password
      )
    ) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const user = await User.findOne({
      attributes: ['id', 'password', 'two_factor_backup', 'two_factor_enabled'],
      where: { id: req.query.uid },
    });
    if (!user) {
      return res.json({ error: "Account doesn't exists.", success: false });
    }
    if (!user.dataValues.two_factor_enabled) {
      return res.json({ error: 'TFA is disabled.', success: false });
    }

    bcrypt.compare(
      req.body.password,
      user.dataValues.password,
      (error, isMatch) => {
        if (error) {
          return res.json({ error, success: false });
        }
        if (!isMatch) {
          return res.json({ error: 'Invalid password.', success: false });
        }

        const isValidBackupToken =
          user.dataValues.two_factor_backup === req.body.backupToken;
        if (!isValidBackupToken) {
          return res.json({ error: 'Invalid token.', success: false });
        }

        user
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            two_factor_backup: null,
          })
          .then((_) => res.json({ success: true, error: false }))
          .catch((error) => {
            console.log('.update() error', error);
            res.json({
              error: 'Error updating given account.',
              success: false,
            });
          });
      },
    );
  },
  /**
   * Disables TFA for the current user.
   * @param {Object} req
   * @param {Object} res
   */
  async disableTFA(req, res) {
    if (
      !(
        req.query &&
        req.query.uid &&
        req.body &&
        req.body.token &&
        req.body.password
      )
    ) {
      return res.json({ error: 'Missing fields.', success: false });
    }

    const user = await User.findOne({
      attributes: ['id', 'password', 'two_factor_secret', 'two_factor_enabled'],
      where: { id: req.query.uid },
    });
    if (!user) {
      return res.json({ error: 'User does not exist.', success: false });
    }
    if (!user.dataValues.two_factor_enabled) {
      return res.json({ error: 'TFA is disabled.', success: false });
    }

    bcrypt.compare(
      req.body.password,
      user.dataValues.password,
      (error, isMatch) => {
        if (error) {
          return res.json({ error, success: false });
        }
        if (!isMatch) {
          return res.json({ error: 'Invalid password.', success: false });
        }
        const isValidToken = speakeasy.totp.verify({
          secret: user.dataValues.two_factor_secret,
          encoding: 'ascii',
          token: req.body.token,
        });
        if (!isValidToken) {
          return res.json({ error: 'Invalid token.', success: false });
        }

        user
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            two_factor_backup: null,
          })
          .then((_) => res.json({ success: true, error: false }))
          .catch((error) => {
            console.log('user.update() error', error);
            res.json({
              error: 'Error updating user data:',
              success: false,
            });
          });
      },
    );
  },
};
