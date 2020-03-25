import Auth from '../Auth';
export default class LinkingService {
  constructor() {
    this.AuthService = new Auth();
  }

  fetchInfo(uid) {
    return this.AuthService.fetch(`/api/linking/info?uid=${uid}`);
  }

  link({ company, userId }) {
    return this.AuthService.fetch(
      `/api/oauth/${company}?uid=${userId}&connect=${company}`,
    );
  }

  unlink({ company, userId }) {
    return this.AuthService.fetch(
      `/api/linking/unlink?uid=${userId}&company=${company}`,
    );
  }
}
