import Auth from '../Auth';
export default class Puro {
  constructor() {
    this.AuthService = new Auth();
  }

  fetchLink(cid) {
    return this.AuthService.fetch(`/api/puro/link?cid=${cid}`);
  }
}
