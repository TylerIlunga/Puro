/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Security
 *  Purpose       :  Module for the Security service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Security".
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
   * enableTFA[GET]
   * Commences the TFA enabling process by generating and sending out
   * the QR Code needed for apps like Google Authenticator and a
   * backup token in case they can not authenticate via Google Authenticator
   * after enabling TFA.
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
    console.log('tfaMap', tfaMap);
    const otpauth_url = speakeasy.otpauthURL({
      secret,
      label: req.query.email,
      issuer: 'Puro',
    });
    console.log('otpauth_url', otpauth_url);
    QRCode.toDataURL(otpauth_url, (err, dataUrl) => {
      if (err) {
        return res.json({
          error: 'Generating data url for QR Code.',
          success: false,
        });
      }
      console.log('dataUrl', dataUrl);
      return res.json({
        backupToken,
        QRCodeImageUrl: dataUrl,
        error: false,
      });
    });
  },
  /**
   * verifyQrCode[POST]
   * Verifies whether or not the user scanned the QR Code generated above
   * and provided the correct token generated via apps like Google Authenticator.
   * If valid, enable TFA for the current user's account.
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
    console.log('tfaMap', tfaMap);
    const isValidToken = speakeasy.totp.verify({
      secret: tfaMap.secret,
      encoding: 'ascii',
      token: req.body.token,
    });
    console.log('isValidToken', isValidToken);
    const isValidBackupToken = tfaMap.backupToken === req.body.backupToken;
    console.log('isValidBackupToken', isValidBackupToken);
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
      .then(result => {
        console.log('User.update() result:', result);
        tfaMap.secret = null;
        tfaMap.backupToken = null;
        delete tfaMap.secret;
        delete tfaMap.backupToken;
        tfaMap = null;
        return res.json({ success: true, error: false });
      })
      .catch(error => {
        console.log('User.update() error');
        return res.json({ error: 'Error updating user data:', success: false });
      });
  },
  /**
   * verifyBackupToken[POST]
   * Verifies supplied backup token from enableTFA() if the current user
   * can not access apps like Google Authenticator app but they remember
   * their backup token.
   */
  async verifyBackupToken(req, res) {
    // NOTE: logs user in, but user must go through the process again of enabling TFA.
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
        console.log('isValidBackupToken', isValidBackupToken);
        if (!isValidBackupToken) {
          return res.json({ error: 'Invalid token.', success: false });
        }
        user
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            two_factor_backup: null,
          })
          .then(result => {
            console.log('user.update() result:', result);
            return res.json({ success: true, error: false });
          })
          .catch(error => {
            console.log('user.update() error');
            return res.json({
              error: 'Error updating user data:',
              success: false,
            });
          });
      },
    );
  },
  /**
   * disableTFA[PUT]
   * Disables TFA for the User.
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
        console.log('isValidToken', isValidToken);
        if (!isValidToken) {
          return res.json({ error: 'Invalid token.', success: false });
        }

        user
          .update({
            two_factor_enabled: false,
            two_factor_secret: null,
            two_factor_backup: null,
          })
          .then(result => {
            console.log('user.update() result:', result);
            return res.json({ success: true, error: false });
          })
          .catch(error => {
            console.log('user.update() error');
            return res.json({
              error: 'Error updating user data:',
              success: false,
            });
          });
      },
    );
  },
};
