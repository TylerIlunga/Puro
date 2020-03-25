/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Campaign
 *  Purpose       :  Module for the Campaign service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   getDataToUpdate()
 *                   list()
 *                   create()
 *                   update()
 *                   export()
 *                   delete()
 *
 *  Notes         :  0
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const { google } = require('googleapis');
const csv = require('csv');
const oauthConfig = require('../OAuth/config');
const { base } = require('../../config');
const db = require('../../db');
const { genid } = require('../../db/config');
const Sequelize = db.getClient();
const Op = Sequelize.Op;
const Campaign = db.Campaign;
const Company = db.Company;
const Entry = db.Entry;
const Form = db.Form;
const FormQuestions = db.FormQuestions;
const LinkedAccount = db.LinkedAccount;
const Puro = db.Puro;
const User = db.User;

const companyTypes = [
  'facebook',
  'instagram',
  'spotify',
  'google',
  'twitter',
  'github',
];

const campaignTypes = ['p_form', 'p_link'];

/**
 * createLinkCampaign
 * @param {Object} requestQuery
 * @param {Object} requestBody
 * @param {Object} res
 */
const createLinkCampaign = (requestQuery, requestBody, res) => {
  const { uid } = requestQuery;
  const { avatar, company, redirect_uri, title, type } = requestBody;
  const pid = genid();
  Campaign.create({
    company,
    pid,
    redirect_uri,
    title,
    type,
    tag: `${title}_${type}-${pid}`,
    avatar: avatar ? avatar : null,
    user_id: uid,
  })
    .then(campaign => {
      Puro.create({
        tag: pid,
        link: campaign.link,
        campaign_id: campaign.id,
      })
        .then(result => {
          Company.create({
            name: company,
            campaign_id: campaign.id,
            campaign_tag: pid,
            puro_id: result.dataValues.id,
          })
            .then(cResult => {
              console.log(' Company.create() cResult', cResult);
              return res.json({
                success: true,
                error: null,
                link: campaign.link,
              });
            })
            .catch(error => {
              throw error;
            });
        })
        .catch(error => {
          console.log('Promise.all() error', error);
          return res.json({
            error: 'Error creating campaign. Contact support.',
            success: false,
          });
        });
    })
    .catch(error => {
      console.log('createLinkCampaign() error', error);
      return res.json({ error: 'Error saving campaign.', success: false });
    });
};

const collectCreateFormQuestionsPromises = (questions, form_id) => {
  let promises = [];
  questions.forEach(question => {
    promises.push(
      FormQuestions.create({
        form_id,
        subject: question.subject,
        input_type: question.fieldId.split('_')[0],
      }),
    );
  });
  return promises;
};

/**
 * createFormCampaign
 * @param {Object} requestQuery
 * @param {Object} requestBody
 * @param {Object} res
 */
const createFormCampaign = (requestQuery, requestBody, res) => {
  const { uid } = requestQuery;
  const { avatar, company, title, type, theme, questions } = requestBody;
  User.findOne({
    where: { id: uid },
  })
    .then(user => {
      const pid = genid();
      Campaign.create({
        company,
        title,
        type,
        pid,
        tag: `${title}_${type}-${pid}`,
        redirect_uri: '', // NOTE: Redirect_URI will be DNS Name for custom form application.
        avatar: avatar ? avatar : null,
        user_id: uid,
      })
        .then(campaign => {
          Puro.create({
            tag: pid,
            link: campaign.link,
            campaign_id: campaign.id,
          })
            .then(puro => {
              Company.create({
                name: company,
                campaign_id: campaign.id,
                campaign_tag: pid,
                puro_id: puro.dataValues.id,
              })
                .then(cResult => {
                  console.log('Company.create() cResult', cResult);
                  // NOTE: handle Form row creation with multiple questions!
                  Form.create({
                    title,
                    theme,
                    campaign_id: campaign.id,
                  }).then(form => {
                    let promises = [];
                    let redirect_uri = `${base}/api/campaigns/form?business=${user.dataValues.business}&company=${company}&cid=${campaign.id}&pid=${puro.dataValues.id}&tag=${pid}&uid=${requestQuery.uid}`;
                    promises.push(
                      ...collectCreateFormQuestionsPromises(
                        questions,
                        form.dataValues.id,
                      ),
                      campaign.update({
                        redirect_uri,
                      }),
                    );
                    Promise.all(promises)
                      .then(finalPromiseResults => {
                        console.log(
                          'campaign.update() finalPromiseResults',
                          finalPromiseResults,
                        );
                        return res.json({
                          success: true,
                          error: null,
                          link: redirect_uri,
                        });
                      })
                      .catch(error => {
                        throw error;
                      });
                  });
                })
                .catch(error => {
                  throw error;
                });
            })
            .catch(error => {
              throw error;
            });
        })
        .catch(error => {
          throw error;
        });
    })
    .catch(error => {
      console.log('createFormCampaign() error', error);
      return res.json({ error: 'Error saving campaign.', success: false });
    });
};

/**
 * getDataToUpdate
 *
 * Organizes the request's body into a Data Structure for
 * the database to interpret and update values in Campaign's
 * table.
 */
const getDataToUpdate = (body, currentCampaign) => {
  return {
    title: body.title ? body.title : currentCampaign.title,
    avatar: body.avatar ? body.avatar : currentCampaign.avatar,
    redirect_uri: body.redirect_uri
      ? body.redirect_uri
      : currentCampaign.redirect_uri,
  };
};

/**
 * exportToGoogleDrive
 * @param {string} title
 * @param {string} csv
 * @param {Object} res
 */
const exportToGoogleDrive = async (userId, title, csv, res) => {
  // 1) Handle Google Oauth
  //    (maybe store user's access and refresh token and state how it's a "connected account")
  // 2) Handle Drive file creation(setup, storing, error handling)
  // 3) return response to user to check Google Drive.
  const oauth2Client = new google.auth.OAuth2(
    oauthConfig.google.client_id,
    oauthConfig.google.client_secret,
    oauthConfig.google.redirect_uri,
  );
  //NOTE: get accessTokens from DB and check if token needs to be refreshed.
  const linkedAccount = await LinkedAccount.findOne({
    where: {
      [Op.and]: [{ user_id: userId }, { company: 'Google' }],
    },
  });
  console.log('linkedAccount', linkedAccount);
  if (!linkedAccount) {
    console.log('No Linked Account on file for (Google)');
    return res.json({
      success: false,
      error: 'Link your Google Account in Settings.',
    });
  }
  const tokens = {
    access_token: linkedAccount.dataValues.access_token,
  };
  console.log('tokens', tokens);
  // oauth2Client.setCredentials(tokens);
  // oauth2Client
  //   .getTokenInfo(tokens.access_token)
  //   .then(result => {
  //     console.log('oauth2Client.getTokenInfo:', result);
  //   })
  //   .catch(error => {
  //     console.log('oauth2Client.getTokenInfo: error', error);
  //   });
  // oauth2Client.refreshToken();

  // NOTE: will need to enabled DRIVE API when switching over to PROD app
  // https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=569240731120
  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
    key: oauthConfig.google.drive.api_key,
  });
  drive.files
    .create({
      requestBody: {
        name: `${title}.csv`,
        mimeType: 'text/csv',
      },
      media: {
        mimeType: 'text/csv',
        body: csv,
      },
    })
    .then(driveResponse => {
      console.log('driveResponse.data', driveResponse.data);
      return res.json({ success: true, error: false });
    })
    .catch(error => {
      console.log('drive.files.create() error', error);
      return res.json({
        success: false,
        error: 'Failed to export to Google Drive. Connect Support',
      });
    });
};

/**
 * exportToComputer
 * @param {string} title
 * @param {string} csv
 * @param {*} res
 */
const exportToComputer = (title, csv, res) => {
  console.log('exportToComputer()');
  console.log('csv', csv);
  console.log('title', title);
  res.setHeader('Content-Disposition', `attachment;filename=${title}.csv`);
  res.writeHead(200, {
    'Content-Type': 'text/csv',
  });
  res.end(csv);
};

module.exports = {
  /**
   * list[GET]
   * Gathers and delievers all of the user's campaigns.
   */
  list(req, res) {
    // TODO: pagination (10-15 per page?)
    console.log('req.session', req.session);
    if (!(req.query && req.query.limit && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    Campaign.findAll({
      where: { user_id: req.query.uid },
      limit: req.query.limit,
      order: [['created_at', 'DESC']],
    })
      .then(campaigns => {
        console.log('campaigns', campaigns);
        return res.json({ campaigns, success: true, error: null });
      })
      .catch(error => {
        return res.json({
          error: 'Error getting campaigns',
          campaigns: null,
          success: false,
        });
      });
  },
  /**
   * create[POST]
   * Creates a new campaign, and stores the shareable link,
   * for the current user.
   */
  async create(req, res) {
    console.log(req.body);
    if (
      !(req.body && req.body.type,
      req.body.title && req.body.company && req.query && req.query.uid)
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }

    if (!companyTypes.includes(req.body.company)) {
      return res.json({ error: 'Invalid company type.', success: false });
    }

    if (!campaignTypes.includes(req.body.type)) {
      return res.json({ error: 'Invalid campaign type.', success: false });
    }

    if (req.body.type === 'p_link' && !req.body.redirect_uri)
      if (
        req.body.type === 'p_form' &&
        !(req.body.questions && req.body.theme)
      ) {
        console.log('2');
        return res.json({ error: 'Missing fields', success: false });
      }

    if (req.body.type === 'p_link') {
      return createLinkCampaign(req.query, req.body, res);
    }
    return createFormCampaign(req.query, req.body, res);
  },
  /**
   * update[PUT]
   * Updates a specified campaign for the current user.
   */
  async update(req, res) {
    if (
      !(
        (req.body.title || req.body.avatar || req.body.redirect_uri) &&
        req.query &&
        req.query.id &&
        req.query.pid &&
        req.query.uid
      )
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const campaign = await Campaign.findOne({
      where: {
        [Op.and]: [
          { id: req.query.id },
          { user_id: req.query.uid },
          { pid: req.query.pid },
        ],
      },
    });
    if (!campaign) {
      return res.json({ error: 'Error getting campaign.', success: false });
    }
    // console.log('campaign:', campaign);

    const updatedCampaignData = getDataToUpdate(req.body, campaign.dataValues);
    let promises = [campaign.update(updatedCampaignData)];

    if (req.body.redirect_uri) {
      const puro = await Puro.findOne({
        where: { campaign_id: req.query.id },
      });
      if (!puro) {
        return res.json({
          error: 'Error updating campaign. Contact support.',
          success: false,
        });
      }
      promises.push(
        puro.update({
          link: `${base}/api/puro?c=${req.query.id}&p=${req.query.pid}&a=${req.query.uid}&r=${req.body.redirect_uri}`,
        }),
      );
    }

    Promise.all(promises)
      .then(result => {
        // console.log('Promise.all result:', result);
        return res.json({ success: true, error: null });
      })
      .catch(error => {
        console.log('campaign.update() error', error);
        return res.json({
          error: 'Error updating your campaign.',
          success: false,
        });
      });
  },
  /**
   * export[GET]
   * Gathers the specified campaign's data, organizes it's
   * information, transforms it into a csv files, and commences
   * a download the current user on the frontend.
   */
  async export(req, res) {
    if (
      !(
        req.query &&
        req.query.uid &&
        req.query.id &&
        req.query.title &&
        req.query.type
      )
    ) {
      return res.json({ error: 'Missing fields', success: false });
    }
    let entries = await Entry.findAll({
      where: { campaign_id: req.query.id },
    });
    console.log('entries', entries);
    if (!entries || entries.length === 0) {
      return res.json({ error: 'No entries to export.', success: false });
    }
    // console.log('entries now entries.dataValues', entries);
    let csvData = [];
    let csvColumns = [];
    const entryKeys = Object.keys(entries[0].dataValues);
    // console.log('entryKeys:', entryKeys);
    entryKeys.forEach(key => {
      if (key !== 'cid' && key !== 'campaign_id') {
        csvColumns.push(key);
      }
    });
    // console.log('csvColumns:', csvColumns);
    entries.forEach(entry => {
      let obj = {};
      entryKeys.forEach(key => {
        if (key === 'created_at') {
          obj[key] = new Date(Number(entry[key])).toDateString();
        } else {
          obj[key] = entry[key];
        }
      });
      csvData.push(obj);
    });
    // console.log('csvData:', csvData);
    const csvOptions = {
      delimiter: ',',
      header: true,
      columns: csvColumns,
    };
    csv.stringify(csvData, csvOptions, (err, output) => {
      if (err) {
        console.log('csv.stringify() err', err);
        return res.json({
          error: 'Error creating csv file. Contact support.',
          success: false,
        });
      }
      if (req.query.type === 'google') {
        return exportToGoogleDrive(req.query.uid, req.query.title, output, res);
      }
      return exportToComputer(req.query.title, output, res);
    });
  },
  async getForm(req, res) {
    if (
      !(
        req.query &&
        req.query.pid &&
        req.query.uid &&
        req.query.cid &&
        req.query.company &&
        req.query.tag &&
        req.query.business
      )
    ) {
      return res.send('Invalid Link.');
    }
  },
  /**
   * delete[DELETE]
   * Deletes a specified campaign.
   */
  async delete(req, res) {
    if (!(req.query && req.query.id && req.query.uid)) {
      return res.json({ error: 'Missing fields', success: false });
    }

    const campaign = await Campaign.findOne({
      where: {
        [Op.and]: [{ id: req.query.id }, { user_id: req.query.uid }], //req.query.user_id
      },
    });
    if (!campaign) {
      return res.json({ error: 'Error getting campaign.', success: false });
    }

    campaign
      .destroy()
      .then(result => {
        console.log('campaign deleted!');
        return res.json({ success: true, error: null });
      })
      .catch(error => {
        console.log('campaign.destroy() error', error);
        return res.json({
          error: 'Error deleting campaign, please contact support@puro.com',
          success: false,
        });
      });
  },
};
