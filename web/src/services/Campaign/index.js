import Auth from '../Auth';
import config from '../../config';

export default class CampaignService {
  constructor() {
    this.AuthService = new Auth();
  }

  list(uid, limit) {
    return this.AuthService.fetch(
      `/api/campaign/list?uid=${uid}&limit=${limit}`,
    );
  }

  create({
    avatar,
    company,
    questions,
    redirect_uri,
    theme,
    title,
    type,
    uid,
  }) {
    console.log('create() type', type);
    if (type === 'link') {
      return this.AuthService.fetch(`/api/campaign/create?uid=${uid}`, {
        method: 'POST',
        body: JSON.stringify({
          avatar,
          redirect_uri,
          title,
          type: `p_${type}`,
          company: company.toLowerCase(),
        }),
      });
    }
    return this.AuthService.fetch(`/api/campaign/create?uid=${uid}`, {
      method: 'POST',
      body: JSON.stringify({
        avatar,
        questions,
        redirect_uri,
        theme: theme.fieldId.split('_')[0],
        title,
        type: `p_${type}`,
        company: company.toLowerCase(),
      }),
    });
  }

  update({ id, pid, user_id, title, redirect_uri, avatar }) {
    return this.AuthService.fetch(
      `/api/campaign/update?id=${id}&pid=${pid}&uid=${user_id}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          avatar,
          id,
          redirect_uri,
          title,
        }),
      },
    );
  }

  exportToGoogleDrive({ domain, uid, id, title, type }) {
    return this.AuthService.fetch(
      `/api/campaign/export?uid=${uid}&id=${id}&title=${title}&type=${type}`,
    );
  }

  exportToComputer({ domain, uid, id, title, type }) {
    const authToken = this.AuthService.getToken();
    const headers = {
      'Access-Control-Allow-Origin': domain,
      Accept: 'text/csv',
      'Content-Type': 'text/csv',
      Authorization: `BEARER ${authToken}`,
      api_key: `OHM ${config.api_key}`,
    };
    return fetch(
      `${domain}/api/campaign/export?uid=${uid}&id=${id}&title=${title}&type=${type}`,
      {
        headers,
        credentials: 'include',
      },
    )
      .then(this._checkStatus)
      .then(response => response.blob())
      .catch(err => err);
  }

  export({ userId, campaignId, title, type }) {
    const data = {
      title,
      type,
      domain: this.AuthService.getDomain(),
      uid: userId,
      id: campaignId,
    };
    if (type === 'google') {
      return this.exportToGoogleDrive(data);
    }
    if (type === 'excel') {
      return this.exportToExcel(data);
    }
    return this.exportToComputer(data);
  }

  delete(id, uid) {
    return this.AuthService.fetch(`/api/campaign/delete?id=${id}&uid=${uid}`, {
      method: 'DELETE',
    });
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
}
