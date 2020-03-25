import Auth from '../Auth';

export default class Remittance {
  constructor() {
    this.AuthService = new Auth();
  }

  review(password) {
    return this.AuthService.fetch('/api/remittance/review', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  create(token) {
    return this.AuthService.fetch('/api/remittance/create', {
      method: 'POST',
      body: JSON.stringify({ stripe_token: token.id }),
    });
  }

  update(token) {
    return this.AuthService.fetch('/api/remittance/update', {
      method: 'PUT',
      body: JSON.stringify({ stripe_token: token.id }),
    });
  }
}
