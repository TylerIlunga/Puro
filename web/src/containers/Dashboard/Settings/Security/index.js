import React, { Component } from 'react';
import './styles.css';

class Security extends Component {
  constructor(props) {
    super(props);
  }

  renderTFACard() {
    return (
      <div className='tfa-container'>
        <h2 className='tfa-header-title'>Two Factor Authentication</h2>
        <p>
          Two-factor authentication is a security process that requires two
          forms of user ID to log in to Puro. It helps keep your account safe
        </p>
        <button className='enable-tfa-button' onClick={this.props.onTFASetting}>
          {this.props.user.two_factor_enabled ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    );
  }

  renderVerifyQRCodeCard(qrUrl, backupToken) {
    return (
      <form
        className='verify-qrcode-container'
        onSubmit={this.props.verifyQrCode}
      >
        <h2 className='tfa-header-title'>Two Factor Authentication</h2>
        <div className='qrcode-row row'>
          <div className='col-9'>
            <ol>
              <li>
                Download a two-factor authenticator app on your mobile device.
              </li>
              <li>Open the app, then scan the QR code to the right.</li>
              <li>
                <span id='important'>Important: </span>
                Save the backup code <span id='important'>
                  {backupToken}
                </span>{' '}
                somewhere <span id='important'>safe</span>. You can use it to
                access your account in the event that you lose your device.
              </li>
              <li>
                Enter the current six-digit numerical password from the
                two-factor authenticator app to complete the setup process.
              </li>
            </ol>
            <br />
            <label>
              <strong>Authenticator Code{}</strong>
            </label>
            <br />
            <input
              type='text'
              value={this.props.tfaDataMap.token}
              onChange={evt => this.props.handleTFAMapUpdate('token', evt)}
            />
          </div>
          <div className='qr-code-container col-3'>
            <img className='qrcode' src={qrUrl} />
          </div>
          <p>
            If you lose your device that has your two-factor authenticator app,
            you can use a backup code to access your account. The backup code
            can only be used once, so keep it somewhere you can access even if
            you lose your mobile device. The backup code for this account is{' '}
            {backupToken}
          </p>
          <button type='submit'>Submit</button>
          <button onClick={this.props.cancelTFARegistration}>Cancel</button>
        </div>
      </form>
    );
  }

  renderDisableTFACard() {
    return (
      <form
        className='verify-qrcode-container'
        onSubmit={this.props.disableTFA}
      >
        <h2 className='tfa-header-title'>Follow the steps below:</h2>
        <div className='col-9'>
          <ol>
            <li>
              Enter the current six-digit numerical password from the two-factor
              authenticator app to complete the setup process.
            </li>
            <br />
            <label>
              <strong>Authenticator Code{}</strong>
            </label>
            <br />
            <input
              type='text'
              value={this.props.tfaDataMap.token}
              onChange={evt => this.props.handleTFAMapUpdate('token', evt)}
            />
            <li>Enter in your current password.</li>
            <br />
            <label>
              <strong>Password{}</strong>
            </label>
            <br />
            <input
              type='password'
              placeholder='********'
              value={this.props.tfaDataMap.password}
              onChange={evt => this.props.handleTFAMapUpdate('password', evt)}
            />
            <br />
            <label>
              <strong>Confirm Password{}</strong>
            </label>
            <br />
            <input
              type='password'
              placeholder='********'
              value={this.props.tfaDataMap.confirmPassword}
              onChange={evt =>
                this.props.handleTFAMapUpdate('confirmPassword', evt)
              }
            />
          </ol>
          <button type='submit'>Submit</button>
          <button onClick={this.props.cancelTFARegistration}>Cancel</button>
        </div>
      </form>
    );
  }

  renderSecurityCard() {
    if (this.props.renderVerifyQrCodeCard) {
      return this.renderVerifyQRCodeCard(
        this.props.tfaDataMap.QRCodeImageUrl,
        this.props.tfaDataMap.backupToken,
      );
    }
    if (this.props.renderDisableTFACard) {
      return this.renderDisableTFACard();
    }
    return this.renderTFACard();
  }

  render() {
    return (
      <div className='security-container col-9'>
        {this.renderSecurityCard()}
        {this.props.renderError()}
        {this.props.renderSuccess()}
      </div>
    );
  }
}

export default Security;
