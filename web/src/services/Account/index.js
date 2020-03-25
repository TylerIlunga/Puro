import Auth from '../Auth';

export default class Account {
  constructor() {
    this.AuthService = new Auth();
  }

  update({ email, business }) {
    return this.AuthService.fetch('/api/account/update', {
      method: 'PUT',
      body: JSON.stringify({ email, business }),
    });
  }

  resetPassword({ currentPassword, newPassword }) {
    return this.AuthService.fetch('/api/account/reset', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
}
