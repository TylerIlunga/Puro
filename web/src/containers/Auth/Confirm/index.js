import React, { Component } from 'react';
import queryString from 'query-string';
import tools from '../../../tools';
import { Auth } from '../../../services';
import './styles.css';

class Confirm extends Component {
  constructor(props) {
    super(props);

    console.log(props.location.search);
    const parsed = queryString.parse(props.location.search);
    console.log('parsed', parsed);

    this.state = {
      email: '',
      token: '',
      success: parsed.msg ? parsed.msg : null,
      error: null,
    };

    this.AuthService = new Auth();
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  inputIsValid(email, token) {
    // return email && token && recaptchaResponse
    return email && token;
  }

  handleConfirm(evt) {
    evt.preventDefault();
    if (!this.inputIsValid(this.state.email, this.state.token)) {
      return tools.handleError(this, 'Required info is missing!');
    }
    this.AuthService.verifyAccount({
      email: this.state.email,
      token: this.state.token,
    })
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        this.setState(
          {
            success: 'Success! Redirecting...',
          },
          () => {
            setTimeout(() => this.props.history.push('/login'));
          },
        );
      })
      .catch(error => {
        console.log('error', error);
        return tools.handleError(this, 'Error confirming account.');
      });
  }

  handleTextChange(key, evt) {
    const newState = {};
    newState[key] = evt.target.value;
    this.setState(newState);
  }

  render() {
    return (
      <div className='confirm-main-container d-flex container-fluid'>
        <div className='confirm-container container'>
          <div className='confirm-card card'>
            <div className='confirm-card-title'>
              <h4 className='confirm-title text-center'>Confirm Account</h4>
            </div>
            <form className='card-body' onSubmit={this.handleConfirm}>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Email</label>
                <input
                  type='email'
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
                  placeholder='*******'
                  value={this.state.token}
                  onChange={evt => this.handleTextChange('token', evt)}
                />
              </div>
              <input
                type='submit'
                value='Confirm'
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

export default Confirm;
