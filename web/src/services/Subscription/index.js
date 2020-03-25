import Auth from '../Auth';
export default class Subscription {
  constructor() {
    this.AuthService = new Auth();
  }

  fetch(uid) {
    return this.AuthService.fetch(`/api/subscription/fetch?uid=${uid}`);
  }

  create(plan, uid) {
    return this.AuthService.fetch(
      `/api/subscription/create?plan=${plan}&uid=${uid}`,
    );
  }

  update(plan, uid) {
    return this.AuthService.fetch(
      `/api/subscription/update?plan=${plan}&uid=${uid}`,
    );
  }

  cancel(uid) {
    return this.AuthService.fetch(`/api/subscription/cancel?uid=${uid}`);
  }
}
