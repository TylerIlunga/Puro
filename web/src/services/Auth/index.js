import config from '../../config';

export default class Auth {
  // Initializing important variables
  constructor() {
    this.localStorage = window.localStorage;
    // console.log('this.localStorage', this.localStorage);
    this.domain = config.api_domain;
    this.fetch = this.fetch.bind(this);
    this.login = this.login.bind(this);
  }

  getDomain() {
    return this.domain;
  }

  fetch(endpoint, options = {}) {
    // performs api calls sending the required authentication headers
    const headers = {
      'Access-Control-Allow-Origin': this.domain,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `BEARER ${this.getToken()}`,
      api_key: `OHM ${config.api_key}`,
    };

    return fetch(`${this.domain}${endpoint}`, {
      ...options,
      headers,
    })
      .then(this._checkStatus)
      .then(response => response.json())
      .catch(err => err);
  }

  _checkStatus(response) {
    // raises an error in case response status is not a success
    if (response.status >= 200 && response.status < 300) {
      // Success status lies between 200 to 300
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  setToken(token) {
    // Saves user token to this.localStorage
    // NOTE: get if "" is returned instead of "".
    // if (this.getToken()) return;
    this.localStorage.setItem('user_token', token);
  }

  getToken() {
    // Retrieves the user token from this.localStorage
    return this.localStorage.getItem('user_token');
  }

  retrieveAccount() {
    console.log('retrieving account');
    const token = this.getToken();
    return this.fetch(`/api/account/retrieve?token=${token}`)
      .then(res => {
        console.log('retrieveAccount RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  login({ email, password }) {
    console.log('logging in ' + email, password);
    // Get a token from api server using the fetch api
    return this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(res => {
        console.log('login RESPONSE', res);
        if (!res.error && res.token) this.setToken(res.token);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  handleTFA({ token }) {
    console.log('handleTFA() token', token);
    return this.fetch(`/api/auth/handleTFA?token=${token}`)
      .then(res => {
        console.log('handleTFA RESPONSE', res);
        if (!res.error && res.token) this.setToken(res.token);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  signUp({ email, password, business }) {
    return this.fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        business,
      }),
    })
      .then(res => {
        console.log('signUp RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  verifyAccount({ email, token }) {
    return this.fetch(`/api/auth/verify?email=${email}&token=${token}`)
      .then(res => {
        console.log('verifyAccount RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  forgotPassword({ email }) {
    return this.fetch('/api/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
      .then(res => {
        console.log('forgotPassword RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  resetPassword({ email, token, newPassword }) {
    return this.fetch('/api/auth/reset', {
      method: 'POST',
      body: JSON.stringify({
        email,
        token,
        newPassword,
      }),
    })
      .then(res => {
        console.log('resetPassword RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  logout() {
    return this.fetch('/api/auth/logout')
      .then(res => {
        console.log('LOGOUT RESPONSE', res);
        // Clear user token and profile data from this.localStorage
        this.localStorage.removeItem('user_token');
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }

  deleteAccount({ id, email, password }) {
    return this.fetch(`'/api/auth/delete?email=${email}&id=${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })
      .then(res => {
        console.log('SIGNUP RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }
}
