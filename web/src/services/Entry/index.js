import Auth from '../Auth';
export default class Entry {
  constructor() {
    this.AuthService = new Auth();
  }

  list(cid, limit) {
    return this.AuthService.fetch(`/api/entry/list?cid=${cid}&limit=${limit}`);
  }

  update({ age, city, email, cid, id }) {
    return this.AuthService.fetch(`/api/entry/update?cid=${cid}&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        age,
        city,
        email,
      }),
    });
  }

  delete({ cid, id }) {
    return this.AuthService.fetch(`/api/entry/?cid=${cid}&id=${id}`, {
      method: 'DELETE',
    });
  }
}
