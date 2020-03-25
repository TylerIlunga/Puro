import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import config from '../../config';
import tools from '../../tools';
import {
  AccountService,
  CampaignService,
  EntryService,
  AnalysisService,
  LinkingService,
  PuroService,
  RemittanceService,
  SecurityService,
  SubscriptionService,
  SupportService,
} from '../../services';
import Campaigns from './Campaigns';
import Analysis from './Analysis';
import Support from './Support';
import Settings from './Settings';
import {
  clearUser,
  retrieveAccount,
  updateUserTFAStatus,
} from '../../redux/actions/account';
import { updateModal } from '../../redux/actions/modal';
import './styles.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.parsedUrl = queryString.parse(props.location.search);
    if (this.parsedUrl && this.parsedUrl.token) {
      window.localStorage.setItem('user_token', this.parsedUrl.token);
    }

    this.state = {
      loading: false,
      campaigns: [],
      campaignListLimit: 26,
      campaignData: {
        avatar: '',
        company: '',
        redirect_uri: '',
        title: '',
        type: 'link',
        link: '',
        cached: null,
        theme: {
          fieldId: '',
        },
        questions: [
          {
            fieldId: '',
            placeholder: '...',
            subject: '',
            value: '',
            subquestions: [],
          },
        ],
      },
      formQuestionThemes: ['Professional', 'Creative'],
      formQuestionInputTypes: ['checkbox', 'color', 'date', 'radio', 'text'],
      congratsImage:
        'https://images.unsplash.com/photo-1515311243575-996e45655c96?ixlib=rb-1.2.1&auto=format&fit=crop&w=2800&q=80',
      activeCampaign: null,
      uniqueLink: null,
      editCampaignMode: false,
      campaignEntries: [],
      // campaignEntries: [
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      //   {email: "t@x.com", username: "Test1", clicks: 10, created_at: 120121},
      // ],
      entryListLimit: 26,
      displayExportDetailsCard: false,
      exportingData: {
        status: '',
      },
      fetchingAnalytics: false,
      analyticalData: {},
      displayNoAnalyticsMessage: false,
      accountData: {
        email: '',
        business: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      linkingData: {
        GoogleIsConnected: false,
        MailchimpIsConnected: false,
      },
      remittanceInfo: null,
      creditCardOptionIsActive: 'active',
      bankAccountOptionIsActive: '',
      displaySubscriptionPlans: false,
      subscriptionInfo: null,
      subscriptionDetails: {
        active: false,
        seed: {
          plan: 'seed',
          rate: '$25/month',
          details: '.....',
          active: false,
        },
        standard: {
          plan: 'standard',
          rate: '$50/month',
          details: '.....',
          active: false,
        },
        scale: {
          plan: 'scale',
          rate: '$100/month',
          details: '.....',
          active: false,
        },
      },
      campaignsIsActive: 'active',
      displayCampaignCreation: false,
      displayCampaignCard: false,
      displayLinkSharingCard: false,
      analysisIsActive: null,
      supportIsActive: null,
      supportFormData: {
        ticketId: '',
        subject: '',
        issue: '',
      },
      settingsIsActive: null,
      accountIsActive: 'active',
      bankingIsActive: null,
      linkingIsActive: null,
      securityIsActive: null,
      subscriptionsIsActive: null,
      error: null,
      success: null,
    };

    /** Services **/
    this.AccountService = new AccountService();
    this.AnalysisService = new AnalysisService();
    this.AuthService = this.AnalysisService.AuthService;
    this.CampaignService = new CampaignService();
    this.EntryService = new EntryService();
    this.PuroService = new PuroService();
    this.LinkingService = new LinkingService();
    this.RemittanceService = new RemittanceService();
    this.SecurityService = new SecurityService();
    this.SubscriptionService = new SubscriptionService();
    this.SupportService = new SupportService();

    /** Auth **/
    this.handleLogOut = this.handleLogOut.bind(this);

    /** Dashboard Container **/
    this.displayModal = this.displayModal.bind(this);
    this.onHandleSuccess = this.onHandleSuccess.bind(this);
    this.renderSuccess = this.renderSuccess.bind(this);
    this.onHandleError = this.onHandleError.bind(this);
    this.renderError = this.renderError.bind(this);
    this.renderActivityContainer = this.renderActivityContainer.bind(this);
    this.handleActiveContainerState = this.handleActiveContainerState.bind(
      this,
    );
    this.handleActiveSettingsState = this.handleActiveSettingsState.bind(this);

    /** Campaign **/
    this.fetchCampaigns = this.fetchCampaigns.bind(this);
    this.clearCampaignData = this.clearCampaignData.bind(this);
    this.renderCampaigns = this.renderCampaigns.bind(this);
    this.handleCampaignCreation = this.handleCampaignCreation.bind(this);
    this.handleCreateCampaign = this.handleCreateCampaign.bind(this);
    this.handleCampaignDataUpdate = this.handleCampaignDataUpdate.bind(this);
    this.handleCampaignFormDataUpdate = this.handleCampaignFormDataUpdate.bind(
      this,
    );
    this.handleCheckboxState = this.handleCheckboxState.bind(this);
    this.addQuestionToCampaignData = this.addQuestionToCampaignData.bind(this);
    this.removeQuestionFromCampaignData = this.removeQuestionFromCampaignData.bind(
      this,
    );
    this.previewFormCampaignWebpage = this.previewFormCampaignWebpage.bind(
      this,
    );
    this.fetchEntries = this.fetchEntries.bind(this);
    this.handleDisplayCampaignCard = this.handleDisplayCampaignCard.bind(this);
    this.fetchUniqueLink = this.fetchUniqueLink.bind(this);
    this.activateEditCampaignMode = this.activateEditCampaignMode.bind(this);
    this.updateActiveCampaignMode = this.updateActiveCampaignMode.bind(this);
    this.clearEditCampaignModeChanges = this.clearEditCampaignModeChanges.bind(
      this,
    );
    this.saveEditCampaignModeChanges = this.saveEditCampaignModeChanges.bind(
      this,
    );
    this.handleActivateExportMode = this.handleActivateExportMode.bind(this);
    this.handleExport = this.handleExport.bind(this);
    this.handleExportingDataUpdate = this.handleExportingDataUpdate.bind(this);
    this.exitCampaignExport = this.exitCampaignExport.bind(this);
    this.handleDeleteCampaign = this.handleDeleteCampaign.bind(this);

    /** Analysis **/
    this.renderAnalysis = this.renderAnalysis.bind(this);
    this.handleViewEntryAnalytics = this.handleViewEntryAnalytics.bind(this);
    this.fetchAnalytics = this.fetchAnalytics.bind(this);
    this.isFetchingAnalysis = this.isFetchingAnalysis.bind(this);
    this.handleNoAnalyticsMessage = this.handleNoAnalyticsMessage.bind(this);
    this.handleAnalyticalDataUpdate = this.handleAnalyticalDataUpdate.bind(
      this,
    );

    /** Support **/
    this.renderSupport = this.renderSupport.bind(this);
    this.handleSupportFormDataUpdate = this.handleSupportFormDataUpdate.bind(
      this,
    );
    this.submitSupportForm = this.submitSupportForm.bind(this);

    /** Settings(General) **/
    this.handleFetchAdditionalSettingsData = this.handleFetchAdditionalSettingsData.bind(
      this,
    );

    /** Settings(Account) **/
    this.handleAccountDataUpdate = this.handleAccountDataUpdate.bind(this);
    this.handleUpdateAccountInfo = this.handleUpdateAccountInfo.bind(this);
    this.handleChangeAccountPassword = this.handleChangeAccountPassword.bind(
      this,
    );

    /** Settings(Banking) **/
    /** Remittance **/
    this.handleActiveBankingOption = this.handleActiveBankingOption.bind(this);
    this.handleCreateUserRemittance = this.handleCreateUserRemittance.bind(
      this,
    );
    this.fetchRemittanceInfo = this.fetchRemittanceInfo.bind(this);

    /** Settings(Linking) */
    this.fetchLinkingDataInfo = this.fetchLinkingDataInfo.bind(this);
    this.handleUpdateLinkingData = this.handleUpdateLinkingData.bind(this);
    this.handleLinkingExternalAccount = this.handleLinkingExternalAccount.bind(
      this,
    );

    /** Settings(Security) **/
    this.handleUserEnabledTFA = this.handleUserEnabledTFA.bind(this);

    /** Settings(Subscription) **/
    this.fetchUserSubscriptionInfo = this.fetchUserSubscriptionInfo.bind(this);
    this.renderSubscriptionCard = this.renderSubscriptionCard.bind(this);
    this.handleActivateSubscription = this.handleActivateSubscription.bind(
      this,
    );
    this.activateAccountSubscription = this.activateAccountSubscription.bind(
      this,
    );
    this.updateAccountSubscriptionInfo = this.updateAccountSubscriptionInfo.bind(
      this,
    );
    this.handleUpdatingSubscriptionDetails = this.handleUpdatingSubscriptionDetails.bind(
      this,
    );
  }

  componentDidMount() {
    window.addEventListener('message', this.windowMessageHandler);
    if (!this.props.user) {
      this.props.retrieveAccount(error => {
        if (error) {
          // NOTE: should not happen?
          console.log('this.props.retrieveAccount() error', error);
          return this.props.history.push('/login');
        }
      });
    }
    if (this.parsedUrl && this.parsedUrl.msg) {
      tools.handleSuccess(this, this.parsedUrl.msg);
    }
    this.fetchCampaigns(this.state.campaignListLimit);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.windowMessageHandler);
  }

  windowMessageHandler(message) {
    try {
      console.log('windowMessageHandler() message', message);
      let messageJson = JSON.parse(message);
      console.log('messageJson:', messageJson);
      if (!messageJson.success) {
        return;
      }
    } catch (error) {
      console.log('windowMessageHandler() error:', error);
    }
    // NOTE: If BroadcoastChannel sends additional data to the client,
    // handle data processing below.
  }

  displayModal(data) {
    this.props.updateModal(data);
    window.$('#infoModal').modal();
  }

  onHandleSuccess(message) {
    return tools.handleSuccess(this, message);
  }

  renderSuccess() {
    return <h3 className='text-center success-text'>{this.state.success}</h3>;
  }

  onHandleError(error) {
    return tools.handleError(this, error);
  }

  renderError() {
    return <h3 className='text-center error-text'>{this.state.error}</h3>;
  }

  handleLogOut() {
    this.AuthService.logout()
      .then(res => {
        if (res.error) {
          console.log(`logout() error`, res.error);
          return tools.handleError(this, 'Error logging out!');
        }
        this.props.history.push('/login');
        this.props.clearUser();
      })
      .catch(error => {
        console.log(`logout() error`, error);
        return tools.handleError(this, 'logout() error');
      });
  }

  fetchCampaigns(limit) {
    const uid = this.props.user && this.props.user.id ? this.props.user.id : 0;
    console.log('fetchCampaigns() uid', uid);
    this.CampaignService.list(uid, limit)
      .then(res => {
        console.log('this.CampaignService res:::', res);
        console.log('campaigns', this.state.campaigns);
        if (res.error) {
          return tools.handleError(this, res.error);
        }
        return this.setState({
          campaigns: res.campaigns,
          campaignListLimit: limit,
        });
      })
      .catch(err => {
        console.log('this.CampaignService err:::', err);
        return tools.handleError(this, 'Internal server error.');
      });
  }

  clearCampaignData(type) {
    if (type === 'link') {
      return this.setState({
        campaignData: {
          ...this.state.campaignData,
          title: '',
          redirect_uri: '',
          company: '',
        },
      });
    }
    return this.setState({
      campaignData: {
        ...this.state.campaignData,
        title: '',
        redirect_uri: '',
        company: '',
        theme: {
          fieldId: '',
        },
        questions: [
          {
            fieldId: '',
            placeholder: '...',
            subject: '',
            value: '',
          },
        ],
      },
    });
  }

  renderDashboardHeader() {
    return (
      <div className='row dashboard-header'>
        <div className='col-3 text-center dashboard-header-label'>
          <h2 className='options-container-title'>Puro</h2>
        </div>
        <div className='col-9 dashboard-header-label d-flex justify-content-end'>
          <li className='nav-item dropdown'>
            <a
              id='profile-dropdown'
              className='nav-link dropdown-toggle'
              data-toggle='dropdown'
              href='#0'
              role='button'
              aria-haspopup='true'
              aria-expanded='false'
            >
              Profile
            </a>
            <div className='dropdown-menu'>
              <a className='dropdown-item' href='#0'>
                Action
              </a>
              <div className='dropdown-divider' />
              <a
                className='dropdown-item'
                href='#logout'
                onClick={this.handleLogOut}
              >
                Log Out
              </a>
            </div>
          </li>
        </div>
      </div>
    );
  }

  handleActiveContainerState(key) {
    if (key === 'campaignsIsActive') {
      this.fetchCampaigns(this.state.campaignListLimit);
      this.clearCampaignData(this.state.campaignData.type);
    }
    const adKeys = Object.keys(this.state.analyticalData);
    if (key === 'analysisIsActive' && adKeys.length === 0) {
      this.fetchAnalytics({
        cid: null,
        company: null,
        general: true,
        plan: null,
        uid: this.props.user.id,
      });
    }
    this.setState({
      campaignsIsActive: key === 'campaignsIsActive' ? 'active' : null,
      analysisIsActive: key === 'analysisIsActive' ? 'active' : null,
      analyticalData:
        key !== 'analysisIsActive' && adKeys.length > 0
          ? {}
          : this.state.analyticalData,
      settingsIsActive: key === 'settingsIsActive' ? 'active' : null,
      supportIsActive: key === 'supportIsActive' ? 'active' : null,
      displayCampaignCreation: false,
      displayLinkSharingCard: false,
      displayCampaignCard: false,
    });
  }

  isFetchingAnalysis(fetchingAnalytics) {
    this.setState({ fetchingAnalytics });
  }

  handleNoAnalyticsMessage() {
    console.log(
      'this.state.displayNoAnalyticsMessage',
      this.state.displayNoAnalyticsMessage,
    );
    this.setState(
      {
        displayNoAnalyticsMessage: true,
      },
      () =>
        console.log(
          'this.state.displayNoAnalyticsMessage',
          this.state.displayNoAnalyticsMessage,
        ),
    );
  }

  handleAnalyticalDataUpdate(data) {
    this.setState(
      {
        analyticalData: {
          ...this.state.analyticalData,
          ...data,
        },
      },
      () => {
        console.log(
          'handleAnalyticalDataUpdate this.state.analyticalData',
          this.state.analyticalData,
        );
      },
    );
  }

  fetchAnalytics({ cid, company, general, plan, uid }) {
    if (general) {
      if (!uid) {
        return tools.handleError(this, 'User id is missing! Contact support.');
      }
      return this.setState({ fetchingAnalytics: true }, () => {
        return this.AnalysisService.general(uid)
          .then(res => {
            console.log(
              'fetchAnalytics() this.AnalysisService.general() res',
              res,
            );
            return this.handleAnalyticalDataUpdate(res.data);
          })
          .catch(error => {
            console.log(
              'fetchAnalytics() this.AnalysisService.general() error',
              error,
            );
            this.setState({ fetchAnalytics: false }, () => {
              return tools.handleError(this, error.message);
            });
          });
      });
    }

    this.AnalysisService.fetch({
      company,
      uid,
      cid,
      plan: plan.standard.active ? 'standard' : 'scale',
    })
      .then(res => {
        console.log('fetchAnalytics() this.AnalysisService.fetch() res', res);
        return this.handleAnalyticalDataUpdate(res.data);
      })
      .catch(error => {
        console.log(
          'fetchAnalytics() this.AnalysisService.fetch() error',
          error,
        );
        this.setState({ fetchAnalytics: false }, () => {
          return tools.handleError(this, error.message);
        });
      });
  }

  handleViewEntryAnalytics(company, cid) {
    console.log('handleViewEntryAnalytics()', company, cid);
    this.fetchUserSubscriptionInfo(() => {
      console.log(
        'fetchUserSubscriptionInfo callback()',
        this.state.subscriptionDetails,
      );
      const { seed, standard, scale } = this.state.subscriptionDetails;
      if (seed.active || !(seed.active || standard.active || scale.active)) {
        return this.displayModal({
          title: 'Upgrade your plan.',
          data:
            "Upgrade to 'Standard' or 'Scale' to view individual campaign analytics. Pricing details can be found {here}",
        });
      }
      this.fetchAnalytics({
        company,
        cid,
        general: false,
        plan: this.state.subscriptionDetails,
        uid: this.props.user.id,
      });
      this.setState({
        campaignsIsActive: null,
        fetchingAnalytics: true,
        analysisIsActive: 'active',
        settingsIsActive: null,
        supportIsActive: null,
        displayCampaignCreation: false,
        displayLinkSharingCard: false,
        displayCampaignCard: false,
      });
    });
  }

  renderSideBarOptions() {
    return (
      <div className='options-container col-3 text-center'>
        <ul className='nav nav-pills nav-pills-info flex-column'>
          <li className='nav-item'>
            <p
              className={`dashboard-option-label nav-link ${this.state.campaignsIsActive}`}
              onClick={() =>
                this.handleActiveContainerState('campaignsIsActive')
              }
              data-toggle='tab'
            >
              Campaigns
            </p>
          </li>
          <li className='nav-item'>
            <p
              className={`dashboard-option-label nav-link ${this.state.analysisIsActive}`}
              onClick={() =>
                this.handleActiveContainerState('analysisIsActive')
              }
              data-toggle='tab'
            >
              Analysis
            </p>
          </li>
          <li className='nav-item'>
            <p
              className={`dashboard-option-label nav-link ${this.state.supportIsActive}`}
              onClick={() => this.handleActiveContainerState('supportIsActive')}
              data-toggle='tab'
            >
              Support
            </p>
          </li>
          <li className='nav-item'>
            <p
              className={`dashboard-option-label nav-link ${this.state.settingsIsActive}`}
              onClick={() =>
                this.handleActiveContainerState('settingsIsActive')
              }
              data-toggle='tab'
            >
              Settings
            </p>
          </li>
        </ul>
      </div>
    );
  }

  validUrl(url) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(url);
  }

  validateCampaignInput(campaignData) {
    const {
      avatar,
      company,
      questions,
      redirect_uri,
      title,
      type,
    } = campaignData;
    if (!this.validUrl(redirect_uri) && type !== 'form') {
      return false;
    }
    if (type !== 'link') {
      return (
        company && title && questions.subject !== '' && questions.value !== ''
      );
    }
    // return avatar && company && redirect_uri && title
    return company && redirect_uri && title;
  }

  handleCreateCampaign(evt) {
    evt.preventDefault();
    console.log('handleCreateCampaign():::', this.state.campaignData);
    if (!this.validateCampaignInput(this.state.campaignData)) {
      return tools.handleError(this, 'All fields must have a value.');
    }
    if (
      !config.availableCompanies.includes(
        this.state.campaignData.company.toLowerCase(),
      )
    ) {
      return tools.handleError(
        this,
        'Invalid company. Choose an available option.',
      );
    }
    const uid = this.props.user && this.props.user.id ? this.props.user.id : 0;
    console.log('uid:', uid);
    const creationData = { ...this.state.campaignData, uid };
    this.CampaignService.create(creationData)
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        this.handleCampaignDataUpdate('link', { target: { value: res.link } });
        return this.setState({
          displayLinkSharingCard: true,
          displayCampaignCreation: false,
        });
      })
      .catch(error => {
        console.log('handleCreateCampaign() error', error);
        return tools.handleError(this, 'Error creating campaign');
      });
  }

  handleCampaignDataUpdate(key, evt) {
    const newState = { campaignData: { ...this.state.campaignData } };
    newState.campaignData[key] = evt.target.value;
    console.log('handleCampaignDataUpdate() newState', newState);
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.campaignData',
        this.state.campaignData,
      );
    });
  }

  handleCheckboxState(inputFieldId, isThemeBox, index) {
    const checkboxElement = document.getElementById(inputFieldId);
    if (!checkboxElement) {
      return;
    }
    if (isThemeBox && this.state.campaignData.theme.fieldId === inputFieldId) {
      checkboxElement.checked = true;
      return;
    }
    if (
      !isThemeBox &&
      this.state.campaignData.questions[index]['fieldId'] === inputFieldId
    ) {
      checkboxElement.checked = true;
      return;
    }
    checkboxElement.checked = false;
  }

  handleCampaignFormDataUpdate(inputFieldId, key, evt) {
    const newState = { campaignData: { ...this.state.campaignData } };
    const splitKeyArray = key.split('.');

    if (splitKeyArray.includes('questions')) {
      const index = splitKeyArray[splitKeyArray.length - 2];
      const questionFieldKey = splitKeyArray[splitKeyArray.length - 1];
      newState.campaignData.questions[index][questionFieldKey] =
        evt.target.value;
      if (questionFieldKey !== 'subject') {
        newState.campaignData.questions[index]['fieldId'] = inputFieldId;
      }
    } else if (key === 'theme') {
      newState.campaignData.theme = {
        fieldId: inputFieldId,
      };
    } else {
      newState.campaignData[key] = evt.target.value;
    }

    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.campaignData',
        this.state.campaignData,
      );
    });
  }

  addQuestionToCampaignData() {
    const newState = { campaignData: { ...this.state.campaignData } };
    newState.campaignData.questions.push({
      subject: '',
      type: 'text',
      placeholder: '...',
      value: '...',
    });
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.campaignData',
        this.state.campaignData,
      );
    });
  }

  removeQuestionFromCampaignData() {
    const newState = { campaignData: { ...this.state.campaignData } };
    newState.campaignData.questions.pop();
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.campaignData',
        this.state.campaignData,
      );
    });
  }
  previewFormCampaignWebpage() {
    console.log('previewFormCampaignWebpage()');
  }

  handleCampaignCreation(value) {
    console.log('handleCreateNewCampaign()');
    this.setState({
      displayCampaignCreation: !this.state.displayCampaignCreation,
    });
  }

  activateEditCampaignMode() {
    console.log('activateEditCampaignMode()');
    const activeCampaign = {
      ...this.state.activeCampaign,
      cached: this.state.activeCampaign,
    };
    console.log('activeCampaign: ', activeCampaign);
    this.setState({
      activeCampaign,
      editCampaignMode: true,
      displayCampaignCreation: false,
      displayLinkSharingCard: false,
      displayCampaignCard: false,
    });
  }

  updateActiveCampaignMode(key, evt) {
    console.log('updateActiveCampaignMode()');
    const newState = { activeCampaign: { ...this.state.activeCampaign } };
    newState.activeCampaign[key] = evt.target.value;
    console.log('updateActiveCampaignMode() newState', newState);
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.activeCampaign',
        this.state.activeCampaign,
      );
    });
  }

  // If user decides not to
  clearEditCampaignModeChanges() {
    console.log('clearEditCampaignModeChanges()');
    const activeCampaign = {
      ...this.state.activeCampaign.cached,
      cached: null,
    };
    this.setState(
      {
        activeCampaign,
        displayCampaignCard: true,
        editCampaignMode: false,
      },
      () => {
        console.log('this.state.activeCampaign', this.state.activeCampaign);
      },
    );
  }

  saveEditCampaignModeChanges(evt) {
    evt.preventDefault();
    console.log(
      'saveEditCampaignModeChanges() activeCampaign',
      this.state.activeCampaign,
    );
    // { id, pid, user_id, title, redirect_uri, avatar }

    this.CampaignService.update(this.state.activeCampaign)
      .then(res => {
        console.log('this.CampaignService.update(): res', res);
        if (res.error) return tools.handleError(this, res.error);
        // handle update
        const activeCampaign = { ...this.state.activeCampaign, cached: null };
        this.setState(
          {
            activeCampaign,
            displayCampaignCard: true,
            editCampaignMode: false,
          },
          () =>
            console.log(
              'this.state.activeCampaign res success',
              this.state.activeCampaign,
            ),
        );
      })
      .catch(error => {
        console.log('this.CampaignService.update() error', error);
        return tools.handleError(this, 'Error updating active campaign.');
      });
  }

  handleActivateExportMode() {
    // TODO: export this.state.campaignData to .csv file
    this.fetchUserSubscriptionInfo(() => {
      console.log(
        'handleActivateExportMode() fetchUserSubscriptionInfo callback()',
        this.state.subscriptionDetails,
      );
      const { seed, standard, scale } = this.state.subscriptionDetails;
      if (seed.active || !(seed.active || standard.active || scale.active)) {
        return this.displayModal({
          title: 'Upgrade your plan.',
          data:
            "Upgrade to 'Standard' or 'Scale' to view individual campaign analytics. Pricing details can be found {here}",
        });
      }
      this.setState({
        displayExportDetailsCard: true,
        displayCampaignCard: false,
      });
    });
  }

  handleExport(type) {
    console.log('handleExport()');
    this.setState({ exporting: true }, () => {
      this.handleExportingDataUpdate('status', 'gathering campaign data...');
      this.CampaignService.export({
        type,
        userId: this.props.user && this.props.user.id ? this.props.user.id : 0,
        campaignId: this.state.activeCampaign.id,
        title: this.state.activeCampaign.title,
      })
        .then(res => {
          console.log('this.CampaignService.export() res', res);
          if (res.type === 'application/json') {
            let fileReader = new FileReader();
            fileReader.addEventListener('loadend', () => {
              console.log('fileReader.result', fileReader.result);
              let jsonResponse = JSON.parse(fileReader.result);
              console.log('jsonResponse', jsonResponse);
              if (type === 'google' && !jsonResponse.error) {
                return this.handleExportingDataUpdate(
                  'status',
                  'Succesfully uploaded to Google Drive!',
                );
              }
              tools.handleError(this, jsonResponse.error);
            });
            return fileReader.readAsText(res);
          }
          if (res.type === 'text/csv') {
            this.handleExportingDataUpdate('status', 'starting download...');
            // handles download via jquery.
            let element = window.document.createElement('a');
            element.href = window.URL.createObjectURL(res);
            element.download = this.state.activeCampaign.title;
            element.click();
            this.handleExportingDataUpdate('status', 'csv file download.');
          }
        })
        .catch(error => {
          console.log('this.CampaignService.export() error', error);
          this.setState({ exporting: false }, () =>
            tools.handleError(this, error),
          );
        });
    });
  }

  handleExportingDataUpdate(key, value) {
    console.log('handleExportingDataUpdate()');
    console.log(key, value);
    let newState = { exportingData: { ...this.state.exportingData } };
    newState.exportingData[key] = value;
    this.setState(newState, () => {
      console.log('this.state.exportingData', this.state.exportingData);
    });
  }

  exitCampaignExport() {
    this.setState({
      displayExportDetailsCard: false,
      displayCampaignCard: true,
      exporting: false,
    });
  }

  handleDeleteCampaign(id) {
    this.CampaignService.delete(id)
      .then(res => {
        console.log('this.CampaignService.delete(id) res::::', res);
        if (res.error) throw res.error;
        return this.handleActiveContainerState('campaignsIsActive');
      })
      .catch(error => {
        console.log('this.CampaignService.delete(id) err::::', error);
        return this.displayModal({
          title: 'Error deleting campaign.',
          data: 'Please contact support',
        });
      });
  }

  fetchUniqueLink(cid) {
    this.PuroService.fetchLink(cid)
      .then(res => {
        console.log('this.PuroService.fetchLink() res::::', res);
        if (res.error) throw res.error;
        return this.setState({ uniqueLink: res.link });
      })
      .catch(error => {
        console.log('this.PuroService.fetchLink() err::::', error);
        return this.setState({
          uniqueLink: 'Error fetching unique link. Contact support.',
        });
      });
  }

  fetchEntries(limit) {
    return this.EntryService.list(this.state.activeCampaign.id, limit)
      .then(res => {
        console.log('fetchEntries() this.EntryService.list() res', res);
        this.setState({
          campaignEntries: res.entries,
          entryListLimit: limit,
        });
      })
      .catch(error => {
        console.log('fetchEntries() this.EntryService.list() error', error);
        return this.displayModal({
          title: 'Error fetching entries for Campaign.',
          data: 'Please contact support',
        });
      });
  }

  handleDisplayCampaignCard(campaign) {
    this.EntryService.list(campaign.id, this.state.entryListLimit)
      .then(res => {
        console.log(
          'handleDisplayCampaignCard() this.EntryService.list() res',
          res,
        );
        this.setState(
          {
            displayCampaignCard: true,
            campaignEntries: res.entries,
            activeCampaign: campaign,
          },
          () => this.fetchUniqueLink(campaign.id),
        );
      })
      .catch(error => {
        console.log(
          'handleDisplayCampaignCard() this.EntryService.list() error',
          error,
        );
        return this.displayModal({
          title: 'Error displaying Campaigns.',
          data: 'Please contact support',
        });
      });
  }

  renderAnalysis() {
    return (
      <Analysis
        isFetchingAnalysis={this.isFetchingAnalysis}
        fetchingAnalytics={this.state.fetchingAnalytics}
        handleNoAnalyticsMessage={this.handleNoAnalyticsMessage}
        displayNoAnalyticsMessage={this.state.displayNoAnalyticsMessage}
        analyticalData={this.state.analyticalData}
        subscriptionDetails={this.state.subscriptionDetails}
        displayModal={this.displayModal}
        renderSuccess={this.renderSuccess}
        renderError={this.renderError}
      />
    );
  }

  handleSupportFormDataUpdate(key, evt) {
    const newState = { supportFormData: { ...this.state.supportFormData } };
    newState.supportFormData[key] = evt.target.value;
    console.log('handleSupportFormDataUpdate() newState', newState);
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.supportFormData',
        this.state.supportFormData,
      );
    });
  }

  submitSupportForm() {
    if (!(this.props.user && this.props.user.id)) {
      return this.displayModal({
        title: "Error submitting issue[Code: 'ID missing']",
        data: 'Please email support@puro.com about the error and your issue.',
      });
    }
    const user_id = this.props.user.id;
    const { ticketId, subject, issue } = this.state.supportFormData;
    this.SupportService.submitIssue({
      ticketId,
      subject,
      issue,
      user_id,
    })
      .then(response => {
        console.log('this.SupportService.submitIssue() response', response);
        if (response.error) {
          throw response.error;
        }
        return this.displayModal({
          title: 'Issue has been submitted.',
          data:
            'Please check your email for a confirmation. We will be in contact with you shortly.',
        });
      })
      .catch(error => {
        console.log('this.SupportService.submitIssue() error', error);
        this.displayModal({
          title: "Error submitting issue. [Code: 'Network Request']",
          data: 'Please email support@puro.com about the error and your issue.',
        });
      });
  }

  renderSupport() {
    return (
      <Support
        supportFormData={this.state.supportFormData}
        handleSupportFormDataUpdate={this.handleSupportFormDataUpdate}
        submitSupportForm={this.submitSupportForm}
        displayModal={this.displayModal}
        handleSuccess={tools.handleSuccess}
        onHandleSuccess={this.onHandleSuccess}
        renderSuccess={this.renderSuccess}
        onHandleError={this.onHandleError}
        renderError={this.renderError}
      />
    );
  }

  handleAccountDataUpdate(key, evt) {
    const newState = { accountData: { ...this.state.accountData } };
    newState.accountData[key] = evt.target.value;
    console.log('handleAccountDataUpdate() newState', newState);
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.accountData',
        this.state.accountData,
      );
    });
  }

  handleUpdateAccountInfo() {
    const { email, business } = this.state.accountData;
    if (email === '' && business === '') {
      return tools.handleError(this, 'Missing information to submit!');
    }
    this.AccountService.update({ email, business })
      .then(res => {
        console.log('this.AccountService.update() res', res);
        if (res.error) throw res.error;
        const newState = { accountData: { ...this.state.accountData } };
        newState.accountData['email'] = email ? email : '';
        newState.accountData['business'] = business ? business : '';
        this.setState(newState, () => {
          return tools.handleSuccess(
            this,
            'Check your email for a verification link!',
          );
        });
      })
      .catch(error => {
        console.log('this.AccountService.update() error', error);
        return tools.handleError(this, error);
      });
  }

  handleChangeAccountPassword() {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = this.state.accountData;
    if (
      currentPassword === '' ||
      newPassword === '' ||
      confirmPassword === ''
    ) {
      return tools.handleError(this, 'Missing information to submit!');
    }
    if (newPassword !== confirmPassword) {
      return tools.handleError(this, 'Passwords do not match!');
    }
    this.AccountService.resetPassword({ currentPassword, newPassword })
      .then(res => {
        console.log('this.AccountService.update() res', res);
        if (res.error) throw res.error;
        return tools.handleSuccess(this, 'Password has been updated!');
      })
      .catch(error => {
        console.log('this.AccountService.resetPassword() error', error);
        return tools.handleError(this, error);
      });
  }

  fetchRemittanceInfo(password) {
    if (!password) {
      return tools.handleError(this, 'Password is required!');
    }
    this.RemittanceService.review(password)
      .then(res => {
        console.log('this.RemittanceService.review() res::::', res);
        if (res.error) throw res.error;
        return this.setState({ remittanceInfo: res.remittance_info });
      })
      .catch(error => {
        console.log('this.RemittanceService.review() err::::', error);
        return tools.handleError(this, error);
      });
  }

  handleUpdatingSubscriptionDetails(subscriptionDetails) {
    console.log('handleUpdatingSubscriptionDetails() obj', subscriptionDetails);
    let details = { ...this.state.subscriptionDetails };
    details.active = true;

    const plan = subscriptionDetails.plan;
    switch (plan) {
      case 'seed':
        details[plan].active = true;
        details['standard'].active = false;
        details['scale'].active = false;
        return details;
      case 'standard':
        details[plan].active = true;
        details['seed'].active = false;
        details['scale'].active = false;
        return details;
      case 'scale':
        details[plan].active = true;
        details['seed'].active = false;
        details['standard'].active = false;
        return details;
      default:
        console.log('handleUpdatingSubscriptionDetails() switch default case.');
        details['seed'].active = false;
        details['standard'].active = false;
        details['scale'].active = false;
        return details;
    }
  }

  handleUserEnabledTFA(isEnabled) {
    this.props.handleUserChangedTFAStatus(isEnabled);
  }

  fetchUserSubscriptionInfo(callback) {
    console.log('fetchUserSubscriptionInfo()');
    const userId =
      this.props.user && this.props.user.id ? this.props.user.id : 0;
    this.SubscriptionService.fetch(userId)
      .then(res => {
        console.log('this.SubscriptionService.fetch() res', res);
        if (res.error) {
          throw res.error;
        }
        return this.setState(
          {
            subscriptionDetails: this.handleUpdatingSubscriptionDetails(
              res.subscriptionDetails,
            ),
            displaySubscriptionPlans: true,
          },
          () => callback(),
        );
      })
      .catch(error => {
        console.log('this.SubscriptionService.fetch() error', error);
        this.setState({ displaySubscriptionPlans: true }, () => {
          callback();
          return tools.handleError(this, error);
        });
      });
  }

  handleFetchAdditionalSettingsData(type) {
    console.log('handleFetchAdditionalSettingsData() type', type);
    switch (type) {
      case 'subscriptionsIsActive':
        return this.fetchUserSubscriptionInfo(() =>
          console.log('fetchUserSubscriptionInfo callback()'),
        );
      case 'linkingIsActive':
        return this.fetchLinkingDataInfo();
      default:
        return;
    }
  }

  handleActiveSettingsState(key) {
    this.handleFetchAdditionalSettingsData(key);
    this.setState({
      accountIsActive: key === 'accountIsActive' ? 'active' : null,
      bankingIsActive: key === 'bankingIsActive' ? 'active' : null,
      linkingIsActive: key === 'linkingIsActive' ? 'active' : null,
      securityIsActive: key === 'securityIsActive' ? 'active' : null,
      subscriptionsIsActive: key === 'subscriptionsIsActive' ? 'active' : null,
    });
  }

  fetchLinkingDataInfo() {
    console.log('fetchLinkingDataInfo()');
    const userId =
      this.props.user && this.props.user.id ? this.props.user.id : 0;
    this.LinkingService.fetchInfo(userId)
      .then(res => {
        console.log('this.LinkingService.fetchInfo() res', res);
        if (res.error) {
          throw res.error;
        }
        this.setState({
          linkingData: {
            GoogleIsConnected: res.GoogleIsConnected,
            MailchimpIsConnected: res.MailchimpIsConnected,
          },
        });
      })
      .catch(error => {
        console.log('this.LinkingService.fetchInfo() error', error);
        tools.handleError(this, error);
      });
  }

  handleUpdateLinkingData(key, value) {
    console.log('handleUpdateLinkingData() key, value', key, value);
    const newState = { ...this.state.linkingData };
    newState[key] = value;
    this.setState(newState);
  }

  handleLinkingExternalAccount({ company, unlink }) {
    console.log(
      'handleLinkingExternalAccount() company, unlink',
      company,
      unlink,
    );
    const linkingData = {
      company,
      userId: this.props.user && this.props.user.id ? this.props.user.id : 0,
    };
    console.log('handleLinkingExternalAccount() linkingData', linkingData);
    if (unlink) {
      return this.LinkingService.unlink(linkingData)
        .then(res => {
          if (res.error) {
            throw res.error;
          }
          this.handleUpdateLinkingData(
            `${linkingData.company}IsConnected`,
            false,
          );
          return tools.handleSuccess(this, 'Successfully unlinked account!');
        })
        .catch(error => {
          console.log('this.LinkingService.unlink() error', error);
          return tools.handleError(this, error);
        });
    }
    this.LinkingService.link(linkingData)
      .then(res => {
        console.log('this.LinkingService.link() res', res);
        if (res.error) {
          throw res.error;
        }
        // NOTE: popup window to handle OAUTH
        let oauthWindow = window.open(
          res.authLink,
          'oauth',
          'width=777,height=777',
        );
        oauthWindow.onunload = function(event) {
          console.log('oauthWindow.onbeforeunload event', event);
          // this.handleUpdateLinkingData(
          //   `${linkingData.company}IsConnected`,
          //   true,
          // );
          return tools.handleSuccess(this, 'Successfully linked account!');
        }.bind(this);
      })
      .catch(error => {
        console.log('this.LinkingService.link() error', error);
        return tools.handleError(this, error);
      });
  }

  handleFetchBankingInformation(key) {
    // NOTE: to pre populate field values within banking.
  }

  handleActiveBankingOption(key) {
    this.handleFetchBankingInformation(key);
    this.setState({
      creditCardOptionIsActive:
        key === 'creditCardOptionIsActive' ? 'active' : null,
      bankAccountOptionIsActive:
        key === 'bankAccountOptionIsActive' ? 'active' : null,
    });
  }

  async handleCreateUserRemittance(token) {
    this.RemittanceService.create(token)
      .then(res => {
        console.log('this.RemittanceService.create(token) res', res);
        if (res.error) {
          throw res.error;
        }
        return tools.handleSuccess(this, 'Successfully updated!');
      })
      .catch(error => {
        console.log('this.RemittanceService.create(token) error', error);
        return tools.handleError(this, error);
      });
  }

  getSubscriptionCardButtonLabel(isActiveButton) {
    return isActiveButton ? 'Activated' : 'Activate';
  }

  activateAccountSubscription(plan) {
    console.log('updateAccountSubscriptionInfo() plan', plan);
    const userId =
      this.props.user && this.props.user.id ? this.props.user.id : 0;
    this.SubscriptionService.create(plan, userId)
      .then(res => {
        console.log('this.SubscriptionService.create() res:::', res);
        if (res.error) {
          return tools.handleError(this, res.error);
        }
        this.setState(
          {
            subscriptionDetails: this.handleUpdatingSubscriptionDetails(
              res.subscriptionDetails,
            ),
            displaySubscriptionPlans: true,
          },
          () => tools.handleSuccess(this, `${plan} plan activated!`),
        );
      })
      .catch(err => {
        console.log('this.SubscriptionService.create() err:::', err);
        return tools.handleError(this, 'Internal server error.');
      });
  }

  updateAccountSubscriptionInfo(plan) {
    console.log('activateAccountSubscription() plan', plan);
    const userId =
      this.props.user && this.props.user.id ? this.props.user.id : 0;
    this.SubscriptionService.update(plan, userId)
      .then(res => {
        console.log('this.SubscriptionService.update() res:::', res);
        if (res.error) {
          return tools.handleError(this, res.error);
        }
        this.setState(
          {
            subscriptionDetails: this.handleUpdatingSubscriptionDetails(
              res.subscriptionDetails,
            ),
            displaySubscriptionPlans: true,
          },
          () => tools.handleSuccess(this, `${plan} plan activated!`),
        );
      })
      .catch(err => {
        console.log('this.SubscriptionService.update() err:::', err);
        return tools.handleError(this, 'Internal server error.');
      });
  }

  handleActivateSubscription({ active, plan }) {
    console.log('handleActivateSubscription() plan', plan);
    if (active) {
      return tools.handleError(this, 'Plan is active!');
    }
    if (this.state.subscriptionDetails.active) {
      return this.updateAccountSubscriptionInfo(plan);
    }
    return this.activateAccountSubscription(plan);
  }

  renderSubscriptionCard(displaySubscriptionPlans, info) {
    if (!displaySubscriptionPlans) return;
    const isActiveSubscription = info.active ? 'info' : 'danger';
    return (
      <div className='ml-auto mr-auto'>
        <div className='card card-pricing bg-primary'>
          <div className='card-body '>
            <div className='icon'>
              <i className='material-icons'>business</i>
            </div>
            <h3 className='card-title'>{info.rate}</h3>
            <p className='card-description'>{info.details}</p>
            <a
              href='#activate'
              className={`btn btn-${isActiveSubscription} btn-round}`}
              onClick={() => this.handleActivateSubscription(info)}
            >
              {this.getSubscriptionCardButtonLabel(info.active)}
            </a>
          </div>
        </div>
      </div>
    );
  }

  renderSettings() {
    return (
      <Settings
        user={this.props.user}
        SecurityService={this.SecurityService}
        accountIsActive={this.state.accountIsActive}
        bankingIsActive={this.state.bankingIsActive}
        linkingIsActive={this.state.linkingIsActive}
        securityIsActive={this.state.securityIsActive}
        subscriptionsIsActive={this.state.subscriptionsIsActive}
        handleActiveSettingsState={this.handleActiveSettingsState}
        accountData={this.state.accountData}
        handleAccountDataUpdate={this.handleAccountDataUpdate}
        handleUpdateAccountInfo={this.handleUpdateAccountInfo}
        handleChangeAccountPassword={this.handleChangeAccountPassword}
        remittanceInfo={this.state.remittanceInfo}
        bankAccountOptionIsActive={this.state.bankAccountOptionIsActive}
        creditCardOptionIsActive={this.state.creditCardOptionIsActive}
        handleActiveBankingOption={this.handleActiveBankingOption}
        handleCreateUserRemittance={this.handleCreateUserRemittance}
        linkingData={this.state.linkingData}
        handleLinkingExternalAccount={this.handleLinkingExternalAccount}
        onUserEnabledTFA={this.handleUserEnabledTFA}
        renderSubscriptionCard={this.renderSubscriptionCard}
        displaySubscriptionPlans={this.state.displaySubscriptionPlans}
        subscriptionDetails={this.state.subscriptionDetails}
        displayModal={this.displayModal}
        handleSuccess={tools.handleSuccess}
        onHandleSuccess={this.onHandleSuccess}
        renderSuccess={this.renderSuccess}
        onHandleError={this.onHandleError}
        renderError={this.renderError}
      />
    );
  }

  renderCampaigns() {
    return (
      <Campaigns
        user={this.props.user}
        handleActiveContainerState={this.handleActiveContainerState}
        fetchCampaigns={this.fetchCampaigns}
        campaignListLimit={this.state.campaignListLimit}
        campaigns={this.state.campaigns}
        campaignData={this.state.campaignData}
        activeCampaign={this.state.activeCampaign}
        handleDisplayCampaignCard={this.handleDisplayCampaignCard}
        displayCampaignCreation={this.state.displayCampaignCreation}
        ccLinkOptionIsActive={this.state.campaignData.type === 'link'}
        ccFormOptionIsActive={this.state.campaignData.type === 'form'}
        handleCheckboxState={this.handleCheckboxState}
        addQuestionToCampaignData={this.addQuestionToCampaignData}
        formQuestionThemes={this.state.formQuestionThemes}
        formQuestionInputTypes={this.state.formQuestionInputTypes}
        removeQuestionFromCampaignData={this.removeQuestionFromCampaignData}
        previewFormCampaignWebpage={this.previewFormCampaignWebpage}
        handleCampaignCreation={this.handleCampaignCreation}
        handleCreateCampaign={this.handleCreateCampaign}
        congratsImage={this.state.congratsImage}
        displayCampaignCard={this.state.displayCampaignCard}
        handleCampaignDataUpdate={this.handleCampaignDataUpdate}
        handleCampaignFormDataUpdate={this.handleCampaignFormDataUpdate}
        displayLinkSharingCard={this.state.displayLinkSharingCard}
        handleViewEntryAnalytics={this.handleViewEntryAnalytics}
        activateEditCampaignMode={this.activateEditCampaignMode}
        editCampaignMode={this.state.editCampaignMode}
        updateActiveCampaignMode={this.updateActiveCampaignMode}
        clearEditCampaignModeChanges={this.clearEditCampaignModeChanges}
        saveEditCampaignModeChanges={this.saveEditCampaignModeChanges}
        displayExportDetailsCard={this.state.displayExportDetailsCard}
        handleActivateExportMode={this.handleActivateExportMode}
        exporting={this.state.exporting}
        handleExport={this.handleExport}
        exportingData={this.state.exportingData}
        exitCampaignExport={this.exitCampaignExport}
        clearEditCampaignModeChanges={this.clearEditCampaignModeChanges}
        handleDeleteCampaign={this.handleDeleteCampaign}
        campaignEntries={this.state.campaignEntries}
        fetchEntries={this.fetchEntries}
        entryListLimit={this.state.entryListLimit}
        uniqueLink={this.state.uniqueLink}
        displayModal={this.displayModal}
        handleSuccess={tools.handleSuccess}
        onHandleSuccess={this.onHandleSuccess}
        renderSuccess={this.renderSuccess}
        onHandleError={this.onHandleError}
        renderError={this.renderError}
      />
    );
  }

  renderActivityContainer() {
    if (this.state.analysisIsActive) {
      return this.renderAnalysis();
    }
    if (this.state.supportIsActive) {
      return this.renderSupport();
    }
    if (this.state.settingsIsActive) {
      return this.renderSettings();
    }
    return this.renderCampaigns();
  }

  render() {
    return (
      <div className='main-container container-fluid'>
        {this.renderDashboardHeader()}
        <div className='content-container row'>
          {this.renderSideBarOptions()}
          {this.renderActivityContainer()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.account.user,
});

const mapDispatchToProps = dispatch => ({
  retrieveAccount: cb => dispatch(retrieveAccount(cb)),
  clearUser: () => dispatch(clearUser()),
  updateModal: data => dispatch(updateModal(data)),
  handleUserChangedTFAStatus: isEnabled =>
    dispatch(updateUserTFAStatus(isEnabled)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
