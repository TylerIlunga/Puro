import React, { Component } from 'react';
import tools from '../../../tools';
import { Auth } from '../../../services';
import './styles.css';

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      recaptchaResponse: '',
      business: '',
      cMessage: 'Check your email for your activation link!',
      isChecked: false,
      error: null,
    };

    this.AuthService = new Auth();
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  // NOTE: clicking on TOS brings up a modal,
  // explaining our terms of service/privacy policy

  inputIsValid(email, password, confirmPassword, isChecked) {
    // return email && password && recaptchaResponse
    if (!(email && password && confirmPassword && isChecked)) {
      return { error: 'Required info is missing!' };
    }
    if (password !== confirmPassword) {
      return { error: 'Required info is missing!' };
    }
    if (password < 7) {
      return { error: 'Password must have at least 7 characters.' };
    }
    // NOTE: Handle at least one special character, capital, and number
    return true;
  }

  handleSignUp(evt) {
    evt.preventDefault();
    const { error } = this.inputIsValid(
      this.state.email,
      this.state.password,
      this.state.confirmPassword,
      this.state.isChecked,
    );
    if (error) {
      return tools.handleError(this, error);
    }
    this.AuthService.signUp({
      email: this.state.email,
      password: this.state.password,
      recaptchaResponse: '',
      business: this.state.business,
    })
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        return this.props.history.push(`/login?msg=${this.state.cMessage}`);
      })
      .catch(error => {
        console.log('error', error);
        return tools.handleError(this, 'Error logging in.');
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
      <div className='signup-main-container d-flex container-fluid'>
        <div className='signup-container container'>
          <div className='signup-card card'>
            <div className='signup-card-title'>
              <h4 className='signup-title text-center'>Sign Up</h4>
            </div>
            <form className='card-body' onSubmit={this.handleSignUp}>
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
                <label className='bmd-label-static'>Business</label>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Example LLC.'
                  value={this.state.business}
                  onChange={evt => this.handleTextChange('business', evt)}
                />
              </div>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Password</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.password}
                  onChange={evt => this.handleTextChange('password', evt)}
                />
              </div>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Confirm Password</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.confirmPassword}
                  onChange={evt =>
                    this.handleTextChange('confirmPassword', evt)
                  }
                />
              </div>
              <div className='form-check form-check-radio'>
                <label className='form-check-label'>
                  <input
                    className='form-check-input'
                    type='radio'
                    name='exampleRadios'
                    id='exampleRadios2'
                    checked={this.state.isChecked}
                    onChange={evt => this.handleTextChange('isChecked', evt)}
                  />
                  I have agreed to our terms of Terms of Service and Privacy
                  Policy.
                  <span className='circle'>
                    <span className='check' />
                  </span>
                </label>
              </div>
              <input
                type='submit'
                value='Sign Up'
                className='btn btn-primary btn-round'
              />
              <p className='text-warning'>
                Have an account?
                <a className='text-info login-link' href='/login'>
                  {' '}
                  LOG IN
                </a>
              </p>
            </form>
            <p className='text-danger text-center'>{this.state.error}</p>
          </div>
        </div>
      </div>
    );
  }
}

export default SignUp;
