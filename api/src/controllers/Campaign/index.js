/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Campaign
 *  Purpose       :  Module for the Campaign service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2020-03-25
 *  Description   :  Module that holds logical controllers for Campaigns.
 *                   Includes the following:
 *                   createLinkCampaign()
 *                   collectCreateFormQuestionsPromises()
 *                   getDataToUpdate()
 *                   exportToGoogleDrive()
 *                   exportToComputerr()
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
        .then(async result => {
          await Company.create({
            name: company,
            campaign_id: campaign.id,
            campaign_tag: pid,
            puro_id: result.dataValues.id,
          });
          return res.json({
            success: true,
            error: null,
            link: campaign.link,
          });
        })
        .catch(error => {
          console.log('Promise.all() error', error);
          return res.json({
            error:
              'Error creating campaign. Contact support@puro.com if problems persists.',
            success: false,
          });
        });
    })
    .catch(error => {
      console.log('createLinkCampaign() error', error);
      return res.json({
        error:
          'Error saving campaign. Contact support@puro.com if problem persists.',
        success: false,
      });
    });
};

/**
 * collectCreateFormQuestionsPromises
 * @param {Array.<Object>} questions
 * @param {Array.<Promise<Object>>} form_id
 */
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
    .then(async user => {
      const pid = genid();
      const campaignData = {
        company,
        title,
        type,
        pid,
        tag: `${title}_${type}-${pid}`,
        redirect_uri: '',
        avatar: avatar ? avatar : null,
        user_id: uid,
      };

      const campaign = await Campaign.create(campaignData);
      const puro = await Puro.create({
        tag: pid,
        link: campaign.link,
        campaign_id: campaign.id,
      });
      const cResult = await Company.create({
        name: company,
        campaign_id: campaign.id,
        campaign_tag: pid,
        puro_id: puro.dataValues.id,
      });
      const form = await Form.create({
        title,
        theme,
        campaign_id: campaign.id,
      });

      let promises = [];
      let redirect_uri = `${base}/api/campaigns/form?business=${user.dataValues.business}&company=${company}&cid=${campaign.id}&pid=${puro.dataValues.id}&tag=${pid}&uid=${requestQuery.uid}`;

      promises.push(
        ...collectCreateFormQuestionsPromises(questions, form.dataValues.id),
      );
      promises.push(
        campaign.update({
          redirect_uri,
        }),
      );

      const cfqsResult = await Promise.all(promises);
      console.log('campaign.update() finalPromiseResults', cfqsResult);

      return res.json({
        success: true,
        error: null,
        link: redirect_uri,
      });
    })
    .catch(error => {
      console.log('createFormCampaign() error', error);
      return res.json({
        error: 'Error saving campaign. Please contact support@puro.com',
        success: false,
      });
    });
};

/**
 * Organizes the given request's body into a data structure familiar to
 * the database to interpret and update rows in the Campaign table.
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
  // 1) Handle Google Oauth: (maybe store user's access and refresh token and state how it's a "connected account")
  // 2) Handle Drive file creation (setup, storing, error handling)
  // 3) Return response to user to check Google Drive.
  const oauth2Client = new google.auth.OAuth2(
    oauthConfig.google.client_id,
    oauthConfig.google.client_secret,
    oauthConfig.google.redirect_uri,
  );
  // NOTE: Would need to fetch accessTokens from DB and check if token needs to be refreshed.
  const linkedAccount = await LinkedAccount.findOne({
    where: {
      [Op.and]: [{ user_id: userId }, { company: 'Google' }],
    },
  });
  if (!linkedAccount) {
    return res.json({
      success: false,
      error: 'Link your Google Account in Settings.',
    });
  }

  oauth2Client
    .getTokenInfo(linkedAccount.dataValues.access_token)
    .then(async tokenInfo => {
      console.log('oauth2Client.getTokenInfo() info:', tokenInfo);
      if (tokenInfo.expiry_date && new Date() >= tokenInfo.expiry_date) {
        oauth2Client.refreshToken();
      }
      // NOTE: One would need to enabled the DRIVE API when switching over to a Production application.
      // https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=569240731120
      const drive = google.drive({
        version: 'v3',
        auth: oauth2Client,
        key: oauthConfig.google.drive.api_key,
      });
      const driveResponse = await drive.files.create({
        requestBody: {
          name: `${title}.csv`,
          mimeType: 'text/csv',
        },
        media: {
          mimeType: 'text/csv',
          body: csv,
        },
      });
      return res.json({
        success: true,
        error: false,
        driveData: driveResponse.data,
      });
    })
    .catch(error => {
      console.log('exportToGoogleDrive() error:', error);
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
 * @param {Object} res
 */
const exportToComputer = (title, csv, res) => {
  res.setHeader('Content-Disposition', `attachment;filename=${title}.csv`);
  res.writeHead(200, { 'Content-Type': 'text/csv' });
  res.end(csv);
};

module.exports = {
  /**
   * Gathers and delievers all of the user's campaigns.
   * @param {Object} req
   * @param {Object} res
   */
  list(req, res) {
    // NOTE: Pagination (10-15 per page) should be implemented for production applications...
    if (!(req.query && req.query.limit && req.query.uid)) {
      return res.json({ error: 'Missing fields.', success: false });
    }
    Campaign.findAll({
      where: { user_id: req.query.uid },
      limit: req.query.limit,
      order: [['created_at', 'DESC']],
    })
      .then(campaigns => {
        res.json({ campaigns, success: true, error: null });
      })
      .catch(_ => {
        return res.json({
          error: 'Error getting campaigns',
          campaigns: null,
          success: false,
        });
      });
  },
  /**
   * Creates a new campaign, and stores the shareable link,
   * for the current user.
   * @param {Object} req
   * @param {Object} res
   */
  async create(req, res) {
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
    if (req.body.type === 'p_form' && !(req.body.questions && req.body.theme)) {
      return res.json({ error: 'Missing fields', success: false });
    }
    if (req.body.type === 'p_link' && !req.body.redirect_uri) {
      return res.json({ error: 'Missing fields', success: false });
    }
    if (req.body.type === 'p_link') {
      return createLinkCampaign(req.query, req.body, res);
    }
    return createFormCampaign(req.query, req.body, res);
  },
  /**
   * Updates a specified campaign for the current user.
   * @param {Object} req
   * @param {Object} res
   */
  async update(req, res) {
    try {
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

      const updatedCampaignData = getDataToUpdate(
        req.body,
        campaign.dataValues,
      );
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

      await Promise.all(promises);

      res.json({ success: true, error: null });
    } catch (error) {
      console.log('.update() error', error);
      res.json({
        error: 'Failed to update campaign. Please contact support@puro.com',
      });
    }
  },
  /**
   * Extracts the specified campaign's data, organizes it's information,
   * transforms it into csv files, and exports it to a user-specified destination.
   * @param {Object} req
   * @param {Object} res
   */
  async export(req, res) {
    try {
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
      if (!entries || entries.length === 0) {
        return res.json({ error: 'No entries to export.', success: false });
      }

      let csvData = [];
      let csvColumns = [];
      const entryKeys = Object.keys(entries[0].dataValues);

      entryKeys.forEach(key => {
        if (key !== 'cid' && key !== 'campaign_id') {
          csvColumns.push(key);
        }
      });
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

      const csvOptions = {
        delimiter: ',',
        header: true,
        columns: csvColumns,
      };
      csv.stringify(csvData, csvOptions, (err, output) => {
        if (err) {
          return res.json({
            error: 'Error creating csv file. Contact support@puro.com',
            success: false,
          });
        }
        if (req.query.type === 'google') {
          return exportToGoogleDrive(
            req.query.uid,
            req.query.title,
            output,
            res,
          );
        }
        return exportToComputer(req.query.title, output, res);
      });
    } catch (error) {
      console.log('.export() error:', error);
      res.json({
        error:
          'Failed to carry out export operation. Please contact support@puro.com',
        success: false,
      });
    }
  },
  /**
   * Deletes a specified campaign.
   * @param {Object} req
   * @param {Object} res
   */
  delete(req, res) {
    if (!(req.query && req.query.id && req.query.uid)) {
      return res.json({ error: 'Missing fields', success: false });
    }

    Campaign.findOne({
      where: {
        [Op.and]: [{ id: req.query.id }, { user_id: req.query.uid }],
      },
    })
      .then(async campaign => {
        if (!campaign) {
          return res.json({ error: 'Error getting campaign.', success: false });
        }

        await campaign.destroy();
        console.log('A campaign has successfully deleted.');
        res.json({ success: true, error: null });
      })
      .catch(error => {
        console.log('.delete() error:', error);
        return res.json({
          error: 'Error deleting campaign, please contact support@puro.com',
          success: false,
        });
      });
  },
};
