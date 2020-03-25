import Auth from '../Auth';
export default class SupportService {
  constructor() {
    this.AuthService = new Auth();
  }

  submitIssue({ ticketId, subject, issue, user_id }) {
    return this.AuthService.fetch(
      `/api/support/issue?tid=${ticketId}&uid=${user_id}`,
      {
        method: 'POST',
        body: JSON.stringify({
          issue,
          subject,
        }),
      },
    );
  }
}
