import React, { Component } from 'react';
import './styles.css';

class Account extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id='account-container' className='col-9'>
        <div id='account-body-container'>
          <div className='row d-flex align-items-center'>
            <div className='col-9'>
              <label className='bmd-label-static'>Email Address</label>
              <input
                type='text'
                className='form-control'
                placeholder={this.props.user.email}
                value={this.props.accountData.email}
                onChange={evt =>
                  this.props.handleAccountDataUpdate('email', evt)
                }
              />
            </div>
            <div className='col-3'>
              <button
                type='button'
                className='btn btn-info'
                onClick={this.props.handleUpdateAccountInfo}
              >
                Change
              </button>
            </div>
          </div>
          <br />
          <div className='row d-flex align-items-center'>
            <div className='col-9'>
              <label className='bmd-label-static'>Business</label>
              <input
                type='text'
                className='form-control'
                placeholder={
                  this.props.user.business
                    ? this.props.user.business
                    : 'MIMO LLC.'
                }
                value={this.props.accountData.business}
                onChange={evt =>
                  this.props.handleAccountDataUpdate('business', evt)
                }
              />
            </div>
            <div className='col-3'>
              <button
                type='button'
                className='btn btn-info'
                onClick={this.props.handleUpdateAccountInfo}
              >
                Change
              </button>
            </div>
          </div>
          <br />
          <div className='row d-flex align-items-center'>
            <div className='col-3'>
              <label className='bmd-label-static'>Current Password</label>
              <input
                type='password'
                className='form-control'
                placeholder='*******'
                value={this.props.accountData.currentPassword}
                onChange={evt =>
                  this.props.handleAccountDataUpdate('currentPassword', evt)
                }
              />
            </div>
            <div className='col-3'>
              <label className='bmd-label-static'>New Password</label>
              <input
                type='password'
                className='form-control'
                placeholder='*******'
                value={this.props.accountData.newPassword}
                onChange={evt =>
                  this.props.handleAccountDataUpdate('newPassword', evt)
                }
              />
            </div>
            <div className='col-3'>
              <label className='bmd-label-static'>Confirm Password</label>
              <input
                type='password'
                className='form-control'
                placeholder='*******'
                value={this.props.accountData.confirmPassword}
                onChange={evt =>
                  this.props.handleAccountDataUpdate('confirmPassword', evt)
                }
              />
            </div>
            <div className='col-3'>
              <button
                type='button'
                className='btn btn-info'
                onClick={() => this.props.handleChangeAccountPassword()}
              >
                Change
              </button>
            </div>
          </div>
          {this.props.renderSuccess()}
          {this.props.renderError()}
        </div>
      </div>
    );
  }
}

export default Account;
