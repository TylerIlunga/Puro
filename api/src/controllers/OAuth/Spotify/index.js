/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/OAuth/Spotify
 *  Purpose       :  Module for the Spotify OAuth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   oauth()
 *                   callback()
 *
 *  Notes         :  1
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const SpotifyWebApi = require('spotify-web-api-node');
const config = require('../config');
const db = require('../../../db');
const { gatherAnalytics } = require('../../../tools');
const Entry = db.Entry;
const redirectUri = config.spotify.redirect_uri;
const clientId = config.spotify.client_id;
const clientSecret = config.spotify.client_secret;
const spotifyAPIState = 'puro_state';
const spotifyApi = new SpotifyWebApi({ redirectUri, clientId, clientSecret });

let account = null;

module.exports = {
  /**
   * oauth[GET]
   * @param {Object} req
   * @param {Object} res
   */
  oauth(req, res) {
    account = {
      campaign_id: req.query.c,
      pid: req.query.p,
      user_id: req.query.a,
      redirect_uri: req.query.r,
    };
    res.redirect(
      spotifyApi.createAuthorizeURL(config.spotify.scopes, spotifyAPIState),
    );
  },
  /**
   * callback[GET]
   * @param {Object} req
   * @param {Object} res
   */
  callback(req, res) {
    if (!account) {
      return res.json({ error: 'OAuth required!', success: false });
    }
    let authorizationCode = req.query.code;
    console.log('authorizationCode', authorizationCode);
    let thisAccessToken, thisRefreshToken;
    let premium = false;

    spotifyApi
      .authorizationCodeGrant(authorizationCode)
      .then((data) => {
        thisAccessToken = data.body['access_token'];
        thisRefreshToken = data.body['refresh_token'];
        spotifyApi.setAccessToken(thisAccessToken);
        spotifyApi.setRefreshToken(thisRefreshToken);
        return spotifyApi.getMe();
      })
      .then(async (data) => {
        if (data.body.product === 'premium') {
          premium = true;
        }
        let spotifyData = data.body;
        if (!spotifyData) {
          console.log('No spotifyData');
        }
        const userEntry = await Entry.findOne({
          where: { company_id: spotifyData.id },
        });
        if (userEntry) {
          console.log('Entry exist.');
          return userEntry
            .update({ clicks: userEntry.dataValues.clicks + 1 })
            .then((_) => res.redirect(account.redirect_uri))
            .catch((error) => {
              console.log('userEntry.update() error', error);
              res.redirect(account.redirect_uri);
            });
        }
        Entry.create({
          company_id: spotifyData.id,
          email: spotifyData.email,
          campaign_id: account.campaign_id,
        })
          .then(async (entry) => {
            console.log('success saving entry', entry);

            res.redirect(account.redirect_uri);

            spotifyApi.setAccessToken(thisAccessToken);
            // NOTE: Depending on subscription, setting limit for top artists might
            // not be a bad idea
            spotifyApi
              .getMyTopArtists({ limit: 5 })
              .then((data) => {
                let artists = [];
                if (data.body && data.body.items && spotifyData) {
                  artists = data.body.items.map((artist) => artist.uri);
                } else {
                  console.log('NO SPOTIFY DATA for (getMyTopArtists)');
                }

                account['entry_id'] = entry.dataValues.id;

                gatherAnalytics(req, account, 'spotify', {
                  access_token: thisAccessToken,
                  refresh_token: thisRefreshToken,
                  premiumAccount: premium,
                  birthdate: spotifyData.birthdate,
                  country: spotifyData.country,
                  name: spotifyData.display_name,
                  email: spotifyData.email,
                  profile: spotifyData.external_urls.spotify,
                  followers: spotifyData.followers.total,
                  product: spotifyData.product,
                  type: spotifyData.type,
                  topArtist: artists.length > 0 ? artists[0] : null,
                });
              })
              .catch((err) =>
                console.log('spotifyApi.getMyTopArtists() err', err),
              );
          })
          .catch((_) => {
            res.json({ error: 'Error saving entry!', success: false });
          });
      })
      .catch((err) => {
        console.log('Error in spotifyApi pipeline', err.message);
        return res.json({
          error: 'Error gathering spotify data',
          success: false,
        });
      });
  },
};
