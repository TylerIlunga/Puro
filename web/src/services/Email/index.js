import config from '../../config';
export default class Email {
  constructor() {
    this.fetch = this.fetch.bind(this);
  }

  fetch(endpoint, options = {}) {
    // performs api calls sending the required authentication headers
    const headers = {
      'Access-Control-Allow-Origin': this.domain,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      api_key: `OHM ${config.api_key}`,
    };

    return fetch(`${this.domain}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
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

  addToList(email) {
    return this.fetch(`/api/email/add?e=${email}`)
      .then(res => {
        console.log('EMAIL RESPONSE', res);
        return Promise.resolve(res);
      })
      .catch(err => Promise.reject(err));
  }
}
