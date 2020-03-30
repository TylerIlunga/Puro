import React, { Component } from 'react';
import tools from '../../../tools';
import { Auth } from '../../../services';
import './styles.css';

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.state = { email: '' };

    this.AuthService = new Auth();
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleForgotPassword = this.handleForgotPassword.bind(this);
  }

  inputIsValid(email) {
    return !!email;
  }

  handleForgotPassword(evt) {
    evt.preventDefault();
    if (!this.inputIsValid(this.state.email)) {
      return tools.handleError(this, 'Required info is missing!');
    }
    this.AuthService.forgotPassword({ email: this.state.email })
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        console.log('redirect');
        return tools.handleSuccess(this, 'Check your email for a reset token!');
      })
      .catch(error => {
        console.log('error', error);
        return tools.handleError(this, 'Error submitting form.');
      });
  }

  handleTextChange(key, evt) {
    const newState = {};
    newState[key] = evt.target.value;
    this.setState(newState);
  }

  render() {
    return (
      <div className='forgot-main-container d-flex container-fluid'>
        <div className='forgot-container container'>
          <div className='forgot-card card'>
            <div className='forgot-card-title'>
              <h4 className='forgot-title text-center'>Forgot Password</h4>
            </div>
            <form className='card-body' onSubmit={this.handleForgotPassword}>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Email</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='test@example.com'
                  value={this.state.email}
                  onChange={evt => this.handleTextChange('email', evt)}
                />
              </div>
              <input
                type='submit'
                value='Submit'
                className='btn btn-primary btn-round'
              />
            </form>
            <p className='text-success text-center'>{this.state.success}</p>
            <p className='text-danger text-center'>{this.state.error}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default ForgotPassword;
