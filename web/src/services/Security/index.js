import Auth from '../Auth';
export default class SecurityService {
  constructor() {
    this.AuthService = new Auth();
  }

  enableTFA(email) {
    return this.AuthService.fetch(`/api/security/enableTFA?email=${email}`);
  }

  verifyQrCode({ backupToken, token, uid }) {
    return this.AuthService.fetch(`/api/security/verifyQrCode?uid=${uid}`, {
      method: 'POST',
      body: JSON.stringify({
        backupToken,
        token,
      }),
    });
  }

  verifyBackupToken({ backupToken, password, uid }) {
    return this.AuthService.fetch(
      `/api/security/verifyBackupToken?uid=${uid}`,
      {
        method: 'POST',
        body: JSON.stringify({
          backupToken,
          password,
        }),
      },
    );
  }

  disableTFA({ token, uid, password }) {
    return this.AuthService.fetch(`/api/security/disableTFA?uid=${uid}`, {
      method: 'PUT',
      body: JSON.stringify({
        token,
        password,
      }),
    });
  }
}
