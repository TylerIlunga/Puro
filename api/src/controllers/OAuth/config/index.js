const { base } = require('../../../config');

const broadcastChannel = msg => {
  return `<script>
    (function(global) {
      var channels = [];

      function BroadcastChannel(channel) {
        var $this = this;
        channel = String(channel);

        var id = '$BroadcastChannel$' + channel + '$';

        channels[id] = channels[id] || [];
        channels[id].push(this);

        this._name = channel;
        this._id = id;
        this._closed = false;
        this._mc = new MessageChannel();
        this._mc.port1.start();
        this._mc.port2.start();

        global.addEventListener('storage', function(e) {
          if (e.storageArea !== global.localStorage) return;
          if (e.newValue === null) return;
          if (e.key.substring(0, id.length) !== id) return;
          var data = JSON.parse(e.newValue);
          $this._mc.port2.postMessage(data);
        });
      }

      BroadcastChannel.prototype = {
        // BroadcastChannel API
        get name() { return this._name; },
        postMessage: function(message) {
          var $this = this;
          if (this._closed) {
            var e = new Error();
            e.name = 'InvalidStateError';
            throw e;
          }
          var value = JSON.stringify(message);

          // Broadcast to other contexts via storage events...
          var key = this._id + String(Date.now()) + '$' + String(Math.random());
          global.localStorage.setItem(key, value);
          setTimeout(function() { global.localStorage.removeItem(key); }, 500);

          // Broadcast to current context via ports
          channels[this._id].forEach(function(bc) {
            if (bc === $this) return;
            bc._mc.port2.postMessage(JSON.parse(value));
          });
        },
        close: function() {
          if (this._closed) return;
          this._closed = true;
          this._mc.port1.close();
          this._mc.port2.close();

          var index = channels[this._id].indexOf(this);
          channels[this._id].splice(index, 1);
        },

        // EventTarget API
        get onmessage() { return this._mc.port1.onmessage; },
        set onmessage(value) { this._mc.port1.onmessage = value; },
        addEventListener: function(type, listener /*, useCapture*/) {
          return this._mc.port1.addEventListener.apply(this._mc.port1, arguments);
        },
        removeEventListener: function(type, listener /*, useCapture*/) {
          return this._mc.port1.removeEventListener.apply(this._mc.port1, arguments);
        },
        dispatchEvent: function(event) {
          return this._mc.port1.dispatchEvent.apply(this._mc.port1, arguments);
        }
      };

      global.BroadcastChannel = global.BroadcastChannel || BroadcastChannel;
      }(self));
      let bc = new BroadcastChannel('channel');
      window.opener.postMessage('${JSON.stringify(msg)}', '*'); /* send */
      window.close();
    </script>
  `;
};

module.exports = {
  broadcastChannel,
  //whatismybrowser
  wimb: {
    base: 'https://api.whatismybrowser.com/api/v2/',
    auth_header: {
      'X-API-KEY': 'c4d05b800db68ddad72260efcdb1e53e',
    },
  },
  facebook: {
    client_id: '792565291117522',
    client_secret: 'dcfb49f6cc16f5e918c5a8a6844ef552',
    fields: {
      profile: 'id,email',
    },
    scopes: {
      dev: 'email',
      prod: `
          default,email,user_age_range,user_birthday,
          user_events,user_gender,user_hometown,user_likes,
          user_link,user_location,user_photos,user_posts,
          instagram_basic
        `,
    },
    redirect_uri: `${base}/api/oauth/facebook/callback`,
  },
  github: {
    client_id: '7608af119dbe24874f1a',
    client_secret: '76039816440c071d74da37802dc990f0a5b13d7a',
    scopes: ['email', 'profile', 'openid'],
    redirect_uri: `${base}/api/oauth/github/callback`,
  },
  google: {
    api_key: 'AIzaSyBaqiMwGaFLSjRdzLAJlcWF4ewYxZhnDRw',
    client_id:
      '569240731120-g8hnlebaicivbhuua506rntlrfeg84pk.apps.googleusercontent.com',
    client_secret: '2ALaEMbOaFhfVX2LcAzO_Slr',
    drive: {
      api_key: 'AIzaSyBOW_yj2lHELQGBERfEzJQD1IWomuwrsuQ',
    },
    scopes: {
      account: ['https://www.googleapis.com/auth/drive'],
      entry: ['email', 'profile', 'openid'],
    },
    redirect_uri: `${base}/api/oauth/google/callback`,
  },
  instagram: {
    client_id: 'e31b61e2725741bab8b534f6c92841bb',
    client_secret: '644d517d964945f19952d8907f2c8e64',
    scopes: {
      scope: ['basic', 'public_content'],
      prod: ['basic', 'public_content', 'likes', 'comments', 'relationships'],
    },
    redirect_uri: `${base}/api/oauth/instagram/callback`,
  },
  linkedin: {
    client_id: '86jgigqyfbrel9',
    client_secret: 'qiKbYwwHpf9PTkIx',
    scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
    redirect_uri: `${base}/api/oauth/linkedin/callback`,
  },
  mailchimp: {
    client_id: '758252941956',
    client_secret: '3593d14541dc6dd52b2bcdc1642144ba6e76474e34c5af73cf',
    redirect_uri: `${base}/api/oauth/mailchimp/callback`,
  },
  snapchat: {
    dev: {
      client_id: '6077f1f2-790e-415e-b4ac-f2698d564cdb',
      client_secret: 'DXdr3o6PASKQd_m5LGzW_v9HiZz4OXMMM8YFmpk7QR0',
    },
    prod: {
      client_id: 'b2a609f3-7e8e-4e57-803c-39255d105ed4',
      client_secret: 'Jgqw-kbdRfmg90IOjfTvZFm18d3YrWMJZtvHCzK3NP4',
    },
    scope:
      'https://auth.snapchat.com/oauth2/api/user.display_name%20https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar',
    redirect_uri: `${base}/api/oauth/snapchat/callback`,
  },
  spotify: {
    client_id: '7d8eb9ef90f64f099b8222fb5430e73a',
    client_secret: '4f699e480dd64c7a990ce091bdc0d1ad',
    scopes: [
      'user-read-private',
      'user-read-email',
      'user-read-birthdate',
      'user-top-read',
      'user-library-modify',
      'user-follow-modify',
      'playlist-modify-public',
    ],
    redirect_uri: `${base}/api/oauth/spotify/callback`,
  },
  twitter: {
    client_id: 'LBaz1UR00s4jqhZsYtkABAL7e',
    client_secret: 'FmlEx3Cdz5BgCXepXY3NwAx5Xmfli7JYoYfU0KKDaPtNeqVJrj',
    access_token: '1090079366829096960-b0xPE2A09qCcyV0XRaFrG3XIjByzYY',
    access_token_secret: 'gL5jkRg6DPyWf8exlxblnyhSsyizHYmLYdnmU3FMvLaFa',
    scopes: { scope: ['basic', 'public_content'] },
    redirect_uri: `${base}/api/oauth/twitter/callback`,
  },
};
