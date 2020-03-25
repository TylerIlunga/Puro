import React, { Component } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  injectStripe,
} from 'react-stripe-elements';
import './styles.css';

class BankingForm extends Component {
  constructor(props) {
    super(props);

    console.log('this.props.stripe', this.props.stripe);

    this.handleBankAccountSubmit = this.handleBankAccountSubmit.bind(this);
    this.handleCreditCardSubmit = this.handleCreditCardSubmit.bind(this);
  }

  async handleBankAccountSubmit(evt) {
    evt.preventDefault();
    let { token, error } = await this.props.stripe.createToken('bank_account', {
      country: 'US',
      currency: 'usd',
      routing_number: '110000000',
      account_number: '000123456789',
      account_holder_name: 'Jenny Rosen',
      account_holder_type: 'individual',
    });
    if (error) {
      console.log('this.props.stripe.createToken() error', error);
      return this.props.onHandleError('Invalid Banking Information.');
    }
    console.log('token', token);
    this.props.successCallback(token);
  }

  renderBankAccountForm() {
    return (
      <form className='card-body' onSubmit={this.handleBankAccountSubmit}>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Account Holder Name</label>
          <input
            type='text'
            className='form-control'
            placeholder='Lily'
            value={this.props.bankAccountData.account_holder_name}
            onChange={evt =>
              this.props.handleBankAccountDataUpdate('account_holder_name', evt)
            }
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Account Holder Type</label>
          <input
            type='text'
            className='form-control'
            placeholder='individual'
            value={this.props.bankAccountData.account_holder_type}
            onChange={evt =>
              this.props.handleBankAccountDataUpdate('account_holder_type', evt)
            }
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Account Number</label>
          <input
            type='text'
            className='form-control'
            placeholder='120143456789'
            value={this.props.bankAccountData.account_number}
            onChange={evt =>
              this.props.handleBankAccountDataUpdate('account_number', evt)
            }
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Routing Number</label>
          <input
            type='text'
            className='form-control'
            placeholder='110590320'
            value={this.props.bankAccountData.routing_number}
            onChange={evt =>
              this.props.handleBankAccountDataUpdate('routing_number', evt)
            }
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Country</label>
          <input
            type='text'
            className='form-control'
            placeholder='US'
            value={this.props.bankAccountData.country}
            onChange={evt =>
              this.props.handleBankAccountDataUpdate('country', evt)
            }
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Currency</label>
          <input
            type='text'
            className='form-control'
            placeholder='usd'
            value={this.props.bankAccountData.currency}
            onChange={evt =>
              this.props.handleBankAccountDataUpdate('currency', evt)
            }
          />
        </div>
        <input type='submit' value='Submit' className='btn btn-info' />
      </form>
    );
  }

  async handleCreditCardSubmit(evt) {
    evt.preventDefault();
    if (this.props.creditCardData.name === '') {
      console.log('handleCreditCardSubmit()');
      return this.props.onHandleError('Please specify a name.');
    }
    let { token, error } = await this.props.stripe.createToken({
      name: this.props.creditCardData.name,
    });
    if (error) {
      console.log('this.props.stripe.createToken() error', error);
      return this.props.onHandleError('Invalid Banking Information.');
    }
    console.log('token', token);
    this.props.successCallback(token);
  }

  renderCreditCardForm() {
    return (
      <form className='card-body' onSubmit={this.handleCreditCardSubmit}>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Name</label>
          <input
            type='text'
            className='form-control'
            placeholder='Lily'
            value={this.props.creditCardData.name}
            onChange={evt => this.props.handleCreditCardDataUpdate('name', evt)}
          />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Card Number</label>
          <CardNumberElement className='form-control' />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>Expiration Date</label>
          <CardExpiryElement className='form-control' />
        </div>
        <div className='form-group bmd-form-group'>
          <label className='bmd-label-static'>CVC</label>
          <CardCVCElement className='form-control' />
        </div>
        <input type='submit' value='Submit' className='btn btn-info' />
        {this.props.renderError()}
        {this.props.renderSuccess()}
      </form>
    );
  }

  render() {
    if (this.props.bankAccountOptionIsActive) {
      return this.renderBankAccountForm();
    }
    return this.renderCreditCardForm();
  }
}

export default injectStripe(BankingForm);
