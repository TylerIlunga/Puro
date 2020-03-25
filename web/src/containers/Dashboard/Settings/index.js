import React, { Component } from 'react';
import Account from './Account';
import Banking from './Banking';
import Linking from './Linking';
import Subscriptions from './Subscriptions';
import Security from './Security';
import './styles.css';

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      backupToken: '',
      QRCodeImageUrl: '',
      tfaDataMap: {
        backupToken: '',
        QRCodeImageUrl: '',
        token: '',
        password: '',
        confirmPassword: '',
      },
      renderVerifyQrCodeCard: false,
      renderDisableTFACard: false,
    };

    /** Settings **/
    this.handleTFAMapUpdate = this.handleTFAMapUpdate.bind(this);
    this.renderSettingsHeader = this.renderSettingsHeader.bind(this);
    this.handleSettingsHeaderTitle = this.handleSettingsHeaderTitle.bind(this);

    /** Security **/
    this.renderSecuritySettings = this.renderSecuritySettings.bind(this);
    this.handleTFASetting = this.handleTFASetting.bind(this);
    this.enableTFA = this.enableTFA.bind(this);
    this.cancelTFARegistration = this.cancelTFARegistration.bind(this);
    this.verifyQrCode = this.verifyQrCode.bind(this);
    this.disableTFA = this.disableTFA.bind(this);
  }

  handleSettingsHeaderTitle() {
    if (this.props.bankingIsActive) {
      return 'Banking';
    }
    if (this.props.linkingIsActive) {
      return 'Linking';
    }
    if (this.props.securityIsActive) {
      return 'Security';
    }
    if (this.props.subscriptionsIsActive) {
      return 'Subscriptions';
    }
    return 'Account';
  }

  renderSettingsHeader() {
    return (
      <div className='settings-header'>
        <h3 className='header-label'>{this.handleSettingsHeaderTitle()}</h3>
      </div>
    );
  }

  renderSettingsSideOptions() {
    return (
      <nav className='nav flex-column col-3'>
        <a
          className={`nav-link ${this.props.accountIsActive}`}
          href='#'
          onClick={() =>
            this.props.handleActiveSettingsState('accountIsActive')
          }
        >
          Account
        </a>
        <a
          className={`nav-link ${this.props.bankingIsActive}`}
          href='#'
          onClick={() =>
            this.props.handleActiveSettingsState('bankingIsActive')
          }
        >
          Banking
        </a>
        <a
          className={`nav-link ${this.props.linkingIsActive}`}
          href='#'
          onClick={() =>
            this.props.handleActiveSettingsState('linkingIsActive')
          }
        >
          Linking
        </a>
        <a
          className={`nav-link ${this.props.subscriptionsIsActive}`}
          href='#'
          onClick={() =>
            this.props.handleActiveSettingsState('securityIsActive')
          }
        >
          Security
        </a>
        <a
          className={`nav-link ${this.props.subscriptionsIsActive}`}
          href='#'
          onClick={() =>
            this.props.handleActiveSettingsState('subscriptionsIsActive')
          }
        >
          Subscriptions
        </a>
      </nav>
    );
  }

  renderBankingSettings() {
    return (
      <Banking
        creditCardOptionIsActive={this.props.creditCardOptionIsActive}
        handleActiveBankingOption={this.props.handleActiveBankingOption}
        bankAccountOptionIsActive={this.props.bankAccountOptionIsActive}
        remittanceInfo={this.props.remittanceInfo}
        handleCreateUserRemittance={this.props.handleCreateUserRemittance}
        onHandleSuccess={this.props.onHandleSuccess}
        onHandleError={this.props.onHandleError}
        handleSuccess={this.props.handleSuccess}
        renderSuccess={this.props.renderSuccess}
        renderError={this.props.renderError}
      />
    );
  }

  renderLinkingSettings() {
    return (
      <Linking
        linkingData={this.props.linkingData}
        handleLinkingExternalAccount={this.props.handleLinkingExternalAccount}
      />
    );
  }

  handleTFAMapUpdate(key, evt) {
    let newState = { tfaDataMap: { ...this.state.tfaDataMap } };
    newState.tfaDataMap[key] = evt.target.value;
    this.setState(newState, () => {
      console.log('this.state.tfaDataMap', this.state.tfaDataMap);
    });
  }

  handleTFASetting() {
    console.log('handleTFASetting()');
    if (!this.props.user.two_factor_enabled) {
      return this.enableTFA();
    }
    console.log('renderDTFAC');
    return this.setState({
      renderDisableTFACard: true,
    });
  }

  enableTFA() {
    this.props.SecurityService.enableTFA(this.props.user.email)
      .then(response => {
        if (response.error) {
          throw response.error;
        }
        console.log(
          'this.props.SecurityService.enableTFA() response',
          response,
        );
        this.setState({
          renderVerifyQrCodeCard: true,
          tfaDataMap: {
            backupToken: response.backupToken,
            QRCodeImageUrl: response.QRCodeImageUrl,
          },
        });
      })
      .catch(error => {
        console.log('this.props.SecurityService().enableTFA() error', error);
        this.props.onHandleError(error.message);
      });
  }

  cancelTFARegistration() {
    return this.setState({
      renderVerifyQrCodeCard: false,
    });
  }

  verifyQrCode(evt) {
    evt.preventDefault();
    const { backupToken, token } = this.state.tfaDataMap;
    if (!(backupToken, token)) {
      return this.props.onHandleError('Missing fields.');
    }
    this.props.SecurityService.verifyQrCode({
      backupToken,
      token,
      uid: this.props.user.id,
    })
      .then(response => {
        if (response.error) {
          throw response.error;
        }
        console.log(
          'this.props.SecurityService.verifyQrCode() response',
          response,
        );
        this.props.onHandleSuccess('Success!');
        this.props.onUserEnabledTFA(true);
        setTimeout(() => {
          this.setState({
            renderVerifyQrCodeCard: false,
          });
        }, 2000);
      })
      .catch(error => {
        console.log('this.props.SecurityService().verifyQrCode() error', error);
        this.props.onHandleError(error.message);
      });
  }

  disableTFA(evt) {
    evt.preventDefault();
    if (this.state.tfaDataMap.token === '') {
      return this.props.onHandleError('Please enter in a token');
    }
    if (this.state.tfaDataMap.password === '') {
      return this.props.onHandleError('Please enter in a password');
    }
    if (
      this.state.tfaDataMap.password !== this.state.tfaDataMap.confirmPassword
    ) {
      return this.props.onHandleError('Passwords do not match.');
    }
    this.props.SecurityService.disableTFA({
      password: this.state.tfaDataMap.password,
      token: this.state.tfaDataMap.token,
      uid: this.props.user.id,
    })
      .then(response => {
        if (response.error) {
          throw response.error;
        }
        console.log(
          'this.props.SecurityService.disableTFA() response',
          response,
        );
        this.props.onHandleSuccess('Success!');
        this.props.onUserEnabledTFA(false);
        setTimeout(() => {
          this.setState({
            renderDisableTFACard: false,
          });
        }, 2000);
      })
      .catch(error => {
        console.log('this.props.SecurityService().disableTFA() error', error);
        this.props.onHandleError(error.message);
      });
  }

  renderSecuritySettings() {
    return (
      <Security
        user={this.props.user}
        onTFASetting={this.handleTFASetting}
        tfaDataMap={this.state.tfaDataMap}
        handleTFAMapUpdate={this.handleTFAMapUpdate}
        enableTFA={this.enableTFA}
        renderVerifyQrCodeCard={this.state.renderVerifyQrCodeCard}
        cancelTFARegistration={this.cancelTFARegistration}
        verifyQrCode={this.verifyQrCode}
        renderDisableTFACard={this.state.renderDisableTFACard}
        disableTFA={this.disableTFA}
        renderSuccess={this.props.renderSuccess}
        renderError={this.props.renderError}
      />
    );
  }

  renderSubscriptionSettings() {
    return (
      <Subscriptions
        displaySubscriptionPlans={this.props.displaySubscriptionPlans}
        renderSubscriptionCard={this.props.renderSubscriptionCard}
        subscriptionDetails={this.props.subscriptionDetails}
        renderSuccess={this.props.renderSuccess}
        renderError={this.props.renderError}
      />
    );
  }

  renderAccountSettings() {
    return (
      <Account
        user={this.props.user}
        accountData={this.props.accountData}
        handleAccountDataUpdate={this.props.handleAccountDataUpdate}
        handleUpdateAccountInfo={this.props.handleUpdateAccountInfo}
        handleChangeAccountPassword={this.props.handleChangeAccountPassword}
        renderSuccess={this.props.renderSuccess}
        renderError={this.props.renderError}
      />
    );
  }

  renderSettingsContent() {
    if (this.props.bankingIsActive) {
      return this.renderBankingSettings();
    }
    if (this.props.linkingIsActive) {
      return this.renderLinkingSettings();
    }
    if (this.props.securityIsActive) {
      return this.renderSecuritySettings();
    }
    if (this.props.subscriptionsIsActive) {
      return this.renderSubscriptionSettings();
    }
    return this.renderAccountSettings();
  }

  render() {
    return (
      <div className='settings-container col-9'>
        {this.renderSettingsHeader()}
        <div className='row settings-content-container'>
          {this.renderSettingsSideOptions()}
          {this.renderSettingsContent()}
        </div>
      </div>
    );
  }
}

export default Settings;
