import config from '../../config';

export default class Auth {
  constructor() {
    this.localStorage = window.localStorage;
    // this.domain = config.api_domain;
    this.domain = 'http://127.0.0.1:1111';
    this.fetch = this.fetch.bind(this);
    this.login = this.login.bind(this);
  }

  getDomain() {
    return this.domain;
  }

  fetch(endpoint, options = {}) {
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
      .then((response) => response.json())
      .catch((err) => err);
  }

  _checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  setToken(token) {
    this.localStorage.setItem('user_token', token);
  }

  getToken() {
    return this.localStorage.getItem('user_token');
  }

  retrieveAccount() {
    const token = this.getToken();
    return this.fetch(`/api/account/retrieve?token=${token}`)
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
  }

  login({ email, password }) {
    return this.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => {
        if (!res.error && res.token) this.setToken(res.token);
        return Promise.resolve(res);
      })
      .catch((err) => Promise.reject(err));
  }

  handleTFA({ token }) {
    return this.fetch(`/api/auth/handleTFA?token=${token}`)
      .then((res) => {
        if (!res.error && res.token) this.setToken(res.token);
        return Promise.resolve(res);
      })
      .catch((err) => Promise.reject(err));
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
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
  }

  verifyAccount({ email, token }) {
    return this.fetch(`/api/auth/verify?email=${email}&token=${token}`)
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
  }

  forgotPassword({ email }) {
    return this.fetch('/api/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
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
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
  }

  logout() {
    return this.fetch('/api/auth/logout')
      .then((res) => {
        this.localStorage.removeItem('user_token');
        return Promise.resolve(res);
      })
      .catch((err) => Promise.reject(err));
  }

  deleteAccount({ id, email, password }) {
    return this.fetch(`'/api/auth/delete?email=${email}&id=${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
  }
}
