import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import tools from '../../../tools';
import { Auth } from '../../../services';
import { updateUser } from '../../../redux/actions/account';
import './styles.css';

class LogIn extends Component {
  constructor(props) {
    super(props);
    console.log('LogIn props', props);

    console.log(props.location.search);
    const parsed = queryString.parse(props.location.search);
    console.log('parsed', parsed);

    this.state = {
      email: '',
      password: '',
      recaptchaResponse: '',
      tfaToken: '',
      tfaEnabled: false,
      tfaBackupEnabled: false,
      tfaBackupToken: '',
      error: null,
      success: parsed.msg ? parsed.msg : null,
    };

    this.AuthService = new Auth();
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleTFA = this.handleTFA.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    if (this.state.success) {
      setTimeout(() => {
        this.setState({ success: null });
      }, 4000);
    }
  }

  handleStateChange(key, evt) {
    const newState = { ...this.state };
    newState[key] = evt.target.value;
    this.setState(newState, () => console.log('this.state', this.state));
  }

  handleTFA(evt) {
    evt.preventDefault();
    // NOTE: handle recaptcha case as well.
    if (this.state.tfaToken === '') {
      return tools.handleError(this, 'Required info is missing.');
    }
    this.AuthService.handleTFA({
      token: this.state.tfaToken,
      recaptchaResponse: 'test',
    })
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        this.props.updateUser(res.user);
        return this.props.history.push('/dashboard');
      })
      .catch(error => {
        console.log('error', error);
        return tools.handleError(this, 'Error logging in.');
      });
  }

  enableTFABackup() {
    return this.setState({
      tfaEnabled: false,
      tfaBackupEnabled: true,
    });
  }

  renderTFACard() {
    return (
      <div className='login-main-container d-flex container-fluid'>
        <div className='login-container container'>
          <div className='login-card card'>
            <div className='login-card-title'>
              <h4 className='login-title text-center'>
                Enter your TFA Token below:
              </h4>
            </div>
            <form className='card-body' onSubmit={this.handleTFA}>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Code</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.tfaToken}
                  onChange={evt => this.handleStateChange('tfaToken', evt)}
                />
              </div>
              <a
                className='text-info signup-link'
                href='#'
                onClick={() =>
                  this.handleStateChange('tfaEnabled', {
                    target: { value: false },
                  })
                }
              >
                Back to Login
              </a>
              <p className='text-warning'>
                Having trouble?
                <a
                  className='text-info signup-link'
                  href='#backup'
                  onClick={this.enableTFABackup}
                >
                  {' '}
                  Verify your account
                </a>
              </p>
              <input
                type='submit'
                value='Verify'
                className='btn btn-primary btn-round'
              />
            </form>
            <p className='text-danger text-center'>{this.state.error}</p>
            <p className='text-success text-center'>{this.state.success}</p>
          </div>
        </div>
      </div>
    );
  }

  renderTFABackupCard() {
    return (
      <div className='login-main-container d-flex container-fluid'>
        <div className='login-container container'>
          <div className='login-card card'>
            <div className='login-card-title'>
              <h4 className='login-title text-center'>
                Enter your Backup Token below:
              </h4>
            </div>
            <form className='card-body' onSubmit={this.handleTFA}>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Code</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.tfaToken}
                  onChange={evt => this.handleStateChange('tfaToken', evt)}
                />
              </div>
              <a
                className='text-info signup-link'
                href='#'
                onClick={() =>
                  this.handleStateChange('tfaEnabled', {
                    target: { value: false },
                  })
                }
              >
                Back to Login
              </a>
              <p className='text-warning'>
                Trouble authenticating?
                <a
                  className='text-info signup-link'
                  href='#backup'
                  onClick={this.enableTFABackup}
                >
                  {' '}
                  Verify Backup Code
                </a>
              </p>
              <input
                type='submit'
                value='Verify'
                className='btn btn-primary btn-round'
              />
            </form>
            <p className='text-danger text-center'>{this.state.error}</p>
            <p className='text-success text-center'>{this.state.success}</p>
          </div>
        </div>
      </div>
    );
  }

  inputIsValid(email, password) {
    // return email && password && recaptchaResponse
    return email && password;
  }
  handleLogin(evt) {
    evt.preventDefault();
    if (!this.inputIsValid(this.state.email, this.state.password)) {
      return tools.handleError(this, 'Required info is missing.');
    }
    this.AuthService.login({
      email: this.state.email,
      password: this.state.password,
      recaptchaResponse: '',
    })
      .then(res => {
        console.log('success: res', res);
        if (res.error) return tools.handleError(this, res.error);
        if (res.tfaEnabled) {
          return this.setState({ tfaEnabled: true });
        }
        this.props.updateUser(res.user);
        return this.props.history.push('/dashboard');
      })
      .catch(error => {
        console.log('error', error);
        return tools.handleError(this, 'Error logging in.');
      });
  }

  renderLoginCard() {
    return (
      <div className='login-main-container d-flex container-fluid'>
        <div className='login-container container'>
          <div className='login-card card'>
            <div className='login-card-title'>
              <h4 className='login-title text-center'>Log In</h4>
            </div>
            <form className='card-body' onSubmit={this.handleLogin}>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Email</label>
                <input
                  type='email'
                  className='form-control'
                  placeholder='test@example.com'
                  value={this.state.email}
                  onChange={evt => this.handleStateChange('email', evt)}
                />
              </div>
              <div className='form-group bmd-form-group'>
                <label className='bmd-label-static'>Password</label>
                <input
                  type='password'
                  className='form-control'
                  placeholder='*******'
                  value={this.state.password}
                  onChange={evt => this.handleStateChange('password', evt)}
                />
              </div>
              <p className='text-warning'>
                Need an account?
                <a className='text-info signup-link' href='/signup'>
                  {' '}
                  SIGN UP
                </a>
              </p>
              <p className='text-warning'>
                Forgot your password?
                <a className='text-info signup-link' href='/forgot'>
                  {' '}
                  RESET
                </a>
              </p>
              <input
                type='submit'
                value='Login'
                className='btn btn-primary btn-round'
              />
            </form>
            <p className='text-danger text-center'>{this.state.error}</p>
            <p className='text-success text-center'>{this.state.success}</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.tfaEnabled) {
      return this.renderTFACard();
    }
    if (this.state.tfaBackupEnabled) {
      return this.renderTFABackupCard();
    }
    return this.renderLoginCard();
  }
}

const mapDispatchToProps = dispatch => ({
  updateUser: user => dispatch(updateUser(user)),
});

export default connect(null, mapDispatchToProps)(LogIn);
