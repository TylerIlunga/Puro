import React, { Component } from 'react';
import queryString from 'query-string';
import tools from '../../../tools';
import { Auth } from '../../../services';
import './styles.css';

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    console.log(props.location.search);
    const parsed = queryString.parse(props.location.search);
    console.log('parsed', parsed);

    this.state = {
      queryIsNotValid: !(parsed && parsed.email && parsed.token),
      email: parsed.email ? parsed.email : '',
      token: parsed.token ? parsed.token : '',
      newPassword: '',
      confirmNewPassword: '',
    };

    this.AuthService = new Auth();
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleResetPassword = this.handleResetPassword.bind(this);
  }

  componentDidMount() {
    if (this.state.queryIsNotValid) {
      return this.props.history.push('/signup');
    }
  }

  // NOTE: clicking on TOS brings up a modal,
  // explaining our terms of service/privacy policy

  inputIsValid(email, newPassword, confirmNewPassword, token) {
    // return && recaptchaResponse
    if (!(email && newPassword && token && confirmNewPassword)) {
      return false;
    }
    return true;
  }

  handleResetPassword(evt) {
    evt.preventDefault();
    const validInput = this.inputIsValid(
      this.state.email,
      this.state.newPassword,
      this.state.confirmNewPassword,
      this.state.token,
    );
    if (!validInput) {
      return tools.handleError(this, 'Required info is missing!');
    }
    this.AuthService.resetPassword({
      email: this.state.email,
      token: this.state.token,
      newPassword: this.state.newPassword,
    })
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        return this.props.history.push('/login?msg=Success');
      })
      .catch(error => {
        console.log('error', error);
        return tools.handleError(this, 'Error resetting password.');
      });
  }

  handleTextChange(key, evt) {
    const newState = {};
    newState[key] =
      key === 'isChecked' ? !this.state.isChecked : evt.target.value;
    console.log(evt.target.value);
    this.setState(newState);
  }

  render() {
    return (
      <div className='reset-password-main-container d-flex container-fluid'>
        <div className='signup-container container'>
          <div className='signup-card card'>
            <div className='signup-card-title'>
              <h4 className='signup-title text-center'>Reset Password</h4>
            </div>
            <form className='card-body' onSubmit={this.handleResetPassword}>
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
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Token</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='********'
                  value={this.state.token}
                  onChange={evt => this.handleTextChange('token', evt)}
                />
              </div>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>New Password</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.newPassword}
                  onChange={evt => this.handleTextChange('newPassword', evt)}
                />
              </div>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Confirm New Password</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.confirmNewPassword}
                  onChange={evt =>
                    this.handleTextChange('confirmNewPassword', evt)
                  }
                />
              </div>
              <input
                type='submit'
                value='Reset'
                className='btn btn-primary btn-round'
              />
            </form>
            <p className='text-danger text-center'>{this.state.error}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
