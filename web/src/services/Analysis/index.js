import Auth from '../Auth';

export default class AnalysisService {
  constructor() {
    this.AuthService = new Auth();
  }

  general(userId) {
    return this.AuthService.fetch(`/api/analysis/general?uid=${userId}`);
  }

  fetch({ cid, company, plan, uid }) {
    return this.AuthService.fetch(
      `/api/analysis/fetch?cid=${cid}&company=${company}&plan=${plan}&uid=${uid}`,
    );
  }

  export(aid, company) {
    return this.AuthService.fetch(
      `/api/analysis/export?aid=${aid}&company=${company}`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
    );
  }
}
