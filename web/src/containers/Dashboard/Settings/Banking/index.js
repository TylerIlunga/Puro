import React, { Component } from 'react';
import config from '../../../../config';
import { StripeProvider, Elements } from 'react-stripe-elements';
import BankingForm from '../../../../components/BankingForm';

class Banking extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stripe: null,
      bankAccountData: {
        country: '',
        currency: '',
        routing_number: '',
        account_number: '',
        account_holder_name: '',
        account_holder_type: '',
      },
      creditCardData: {
        name: '',
      },
    };

    this.handleBankAccountDataUpdate = this.handleBankAccountDataUpdate.bind(
      this,
    );
    this.handleCreditCardDataUpdate = this.handleCreditCardDataUpdate.bind(
      this,
    );
  }

  componentDidMount() {
    if (window.Stripe && !this.state.stripe) {
      return this.setState({ stripe: window.Stripe(config.stripe.api_key) });
    }
    document.querySelector('#stripe-js').addEventListener('load', () => {
      return this.setState({ stripe: window.Stripe(config.stripe.api_key) });
    });
  }

  // NOTE: CHANGE
  // 3) Populate Card Sections
  // 3a) No Data: "Add a Bank Account" card
  // 3b) Data: Card with minimum remittance_info displayed
  renderBankingOptionsHeader() {
    return (
      <ul className='nav nav-pills nav-pills-info d-flex align-items-center'>
        <li className='nav-item'>
          <a
            className={`nav-link ${this.props.creditCardOptionIsActive}`}
            href='#card'
            onClick={() =>
              this.props.handleActiveBankingOption('creditCardOptionIsActive')
            }
          >
            Credit Card
          </a>
        </li>
        <li className='nav-item'>
          <a
            className={`nav-link ${this.props.bankAccountOptionIsActive}`}
            href='#bank'
            onClick={() =>
              this.props.handleActiveBankingOption('bankAccountOptionIsActive')
            }
          >
            Bank Account
          </a>
        </li>
      </ul>
    );
  }

  handleBankAccountDataUpdate(key, evt) {
    const newState = { bankAccountData: { ...this.state.bankAccountData } };
    newState.bankAccountData[key] = evt.target.value;
    console.log('handleBankAccountDataUpdate() newState', newState);
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.bankAccountData',
        this.state.bankAccountData,
      );
    });
  }

  handleCreditCardDataUpdate(key, evt) {
    const newState = { creditCardData: { ...this.state.creditCardData } };
    newState.creditCardData[key] = evt.target.value;
    console.log('handleCreditCardDataUpdate() newState', newState);
    this.setState(newState, () => {
      console.log(
        'this.setState() this.state.creditCardData',
        this.state.creditCardData,
      );
    });
  }

  renderActiveBankingOption() {
    return (
      <StripeProvider stripe={this.state.stripe}>
        <Elements>
          <BankingForm
            bankAccountData={this.state.bankAccountData}
            handleBankAccountDataUpdate={this.handleBankAccountDataUpdate}
            bankAccountOptionIsActive={this.props.bankAccountOptionIsActive}
            creditCardData={this.state.creditCardData}
            handleCreditCardDataUpdate={this.handleCreditCardDataUpdate}
            creditCardOptionIsActive={this.props.creditCardOptionIsActive}
            remittanceInfo={this.props.remittanceInfo}
            successCallback={this.props.handleCreateUserRemittance}
            onHandleSuccess={this.props.onHandleSuccess}
            onHandleError={this.props.onHandleError}
            handleSuccess={this.props.handleSuccess}
            renderSuccess={this.props.renderSuccess}
            renderError={this.props.renderError}
          />
        </Elements>
      </StripeProvider>
    );
  }

  render() {
    return (
      <div className='col-9'>
        {this.renderBankingOptionsHeader()}
        <br />
        {this.renderActiveBankingOption()}
      </div>
    );
  }
}

export default Banking;
