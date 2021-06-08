# Puro

## Description

- Old side project I was working on to expand my knowledge base on building out a SAAS project during university.
- Puro allows users to create link campaigns and view simple stats based on interaction with the generated link.
- Please keep in mind that this project used external third-party services for features such as dispatching emails (SendGrid), managing banking/subscription info (Stripe), 2FA (speakeasy), OAUTH (several), etc.
- An example of service configuration can be found within the .env file (all credentials there are invalid/inactive)

## Client

Features include:

0. Basic Authentication (Sign Up, Confirm Account, Log In, Forgot Password, Reset Password, etc)
1. Creating a campaign and copying the generated link to share
2. Editing campaigns
3. Deleting campaigns
4. Exporting campaign information
5. Viewing analytics such as Total Entries, Top Companies, Total Clicks, Top Emails, Top Usernames, Top IP Count, Top Countries, Top Country Codes, Top Software, Top Software Versions, and Top Operating Systems
6. Generating a personal Ticket ID and submitting a new ticket to a/the Customer Support team
7. Editing account information
8. Connecting your debit/credit card and/or your bank account information
9. Linking your Google account to export campaign data to Google Sheets
10. Enabling Two-Factor Authentication with Google Authenticator
11. Reviewing / Activating a subscription plan

## API

- The following route signatures can be found within [/src/routes](https://github.com/TylerIlunga/Puro/tree/master/api/src/routes)
- The logic for each route can be found within [/src/controllers](https://github.com/TylerIlunga/Puro/tree/master/api/src/controllers)

```
[
  {
    "method": "GET",
    "path": "/api/ping"
  },
  {
    "method": "POST",
    "path": "/api/auth/signup"
  },
  {
    "method": "GET",
    "path": "/api/auth/resendEmail"
  },
  {
    "method": "GET",
    "path": "/api/auth/verify"
  },
  {
    "method": "POST",
    "path": "/api/auth/login"
  },
  {
    "method": "GET",
    "path": "/api/auth/handleTFA"
  },
  {
    "method": "POST",
    "path": "/api/auth/forgot"
  },
  {
    "method": "GET",
    "path": "/api/auth/reset"
  },
  {
    "method": "POST",
    "path": "/api/auth/reset"
  },
  {
    "method": "GET",
    "path": "/api/auth/logout"
  },
  {
    "method": "DELETE",
    "path": "/api/auth/delete"
  },
  {
    "method": "GET",
    "path": "/api/account/retrieve"
  },
  {
    "method": "GET",
    "path": "/api/account/verify"
  },
  {
    "method": "PUT",
    "path": "/api/account/update"
  },
  {
    "method": "PUT",
    "path": "/api/account/reset"
  },
  {
    "method": "GET",
    "path": "/api/account/snapshot"
  },
  {
    "method": "GET",
    "path": "/api/campaign/list"
  },
  {
    "method": "POST",
    "path": "/api/campaign/create"
  },
  {
    "method": "PUT",
    "path": "/api/campaign/update"
  },
  {
    "method": "GET",
    "path": "/api/campaign/export"
  },
  {
    "method": "DELETE",
    "path": "/api/campaign/delete"
  },
  {
    "method": "GET",
    "path": "/api/puro"
  },
  {
    "method": "GET",
    "path": "/api/puro/link"
  },
  {
    "method": "GET",
    "path": "/api/oauth/facebook"
  },
  {
    "method": "GET",
    "path": "/api/oauth/facebook/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/github"
  },
  {
    "method": "GET",
    "path": "/api/oauth/github/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/google"
  },
  {
    "method": "GET",
    "path": "/api/oauth/google/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/instagram"
  },
  {
    "method": "GET",
    "path": "/api/oauth/instagram/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/mailchimp"
  },
  {
    "method": "GET",
    "path": "/api/oauth/mailchimp/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/snapchat"
  },
  {
    "method": "GET",
    "path": "/api/oauth/snapchat/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/spotify"
  },
  {
    "method": "GET",
    "path": "/api/oauth/spotify/callback"
  },
  {
    "method": "GET",
    "path": "/api/oauth/twitter"
  },
  {
    "method": "GET",
    "path": "/api/oauth/twitter/callback"
  },
  {
    "method": "GET",
    "path": "/api/linking/info"
  },
  {
    "method": "GET",
    "path": "/api/linking/unlink"
  },
  {
    "method": "GET",
    "path": "/api/entry/list"
  },
  {
    "method": "PUT",
    "path": "/api/entry/update"
  },
  {
    "method": "DELETE",
    "path": "/api/entry/delete"
  },
  {
    "method": "GET",
    "path": "/api/entry/create"
  },
  {
    "method": "GET",
    "path": "/api/analysis/general"
  },
  {
    "method": "GET",
    "path": "/api/analysis/fetch"
  },
  {
    "method": "GET",
    "path": "/api/analysis/seed"
  },
  {
    "method": "POST",
    "path": "/api/support/issue"
  },
  {
    "method": "POST",
    "path": "/api/remittance/review"
  },
  {
    "method": "POST",
    "path": "/api/remittance/create"
  },
  {
    "method": "PUT",
    "path": "/api/remittance/update"
  },
  {
    "method": "GET",
    "path": "/api/security/enableTFA"
  },
  {
    "method": "POST",
    "path": "/api/security/verifyQrCode"
  },
  {
    "method": "POST",
    "path": "/api/security/verifyBackupToken"
  },
  {
    "method": "PUT",
    "path": "/api/security/disableTFA"
  },
  {
    "method": "GET",
    "path": "/api/snapshot/take"
  },
  {
    "method": "GET",
    "path": "/api/subscription/fetch"
  },
  {
    "method": "GET",
    "path": "/api/subscription/create"
  },
  {
    "method": "GET",
    "path": "/api/subscription/update"
  },
  {
    "method": "GET",
    "path": "/api/subscription/cancel"
  },
  {
    "method": "GET",
    "path": "/api/email/add"
  }
]
```
