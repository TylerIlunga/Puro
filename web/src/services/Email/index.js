import config from '../../config';
import Auth from '../Auth';
export default class Email {
  constructor() {
    this.AuthService = new Auth();
    this.fetch = this.fetch.bind(this);
  }

  fetch(endpoint, options = {}) {
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
      .then(this.AuthService._checkStatus)
      .then((response) => response.json())
      .catch((err) => err);
  }

  addToList(email) {
    return this.fetch(`/api/email/add?e=${email}`)
      .then((res) => Promise.resolve(res))
      .catch((err) => Promise.reject(err));
  }
}
