import React, { Component } from 'react';
import './styles.css';

class Linking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      GoogleLogo: '',
      MailchimpLogo: '',
      GoogleDescription: `
      Link your Google account to export campaign data to Google Sheets.
      `,
      MailchimpDescription: `
        Link your Mailchimp account to send out generated mailchimp email templates
        to all of the gathered emails in a specific campaign.
      `,
    };
  }

  renderLinkingOption(company, isConnected) {
    return (
      <div className='card'>
        <div className='card-body col-10'>
          <div className='row'>
            <div className='linked-account-info-container col-10'>
              <img src={this.state[`${company}Logo`]} />
              <h2 className='linked-account-company-title'>{company}</h2>
              <p className='linked-account-description'>
                {this.state[`${company}Description`]}
              </p>
            </div>
            <div className='linked-account-toggle-container col-2'>
              <button
                onClick={() =>
                  this.props.handleLinkingExternalAccount({
                    company,
                    unlink: isConnected ? true : false,
                  })
                }
              >
                {isConnected ? 'Unlink' : 'Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='linking-container col-9'>
        <h3 className='linking-title'>Link the external accounts below:</h3>
        {this.renderLinkingOption(
          'Google',
          this.props.linkingData.GoogleIsConnected,
        )}
        {this.renderLinkingOption(
          'Mailchimp',
          this.props.linkingData.MailchimpIsConnected,
        )}
      </div>
    );
  }
}

export default Linking;
