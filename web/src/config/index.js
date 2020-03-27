console.log('process.env', process.env);
export default {
  api_key:
    process.env.API_KEY || '^E9NHbjjJLg8Y3FuO2C!$&2#j&lzWhYyTHFXEW46Mgqe5Ta5sB',
  api_domain: process.env.API_DOMAIN || 'http://127.0.0.1:1111',
  testGraphColors: [
    '#FF0033',
    '#2D6BDA',
    '#00CC00',
    '#FFD632',
    '#FFC0CB',
    '#774CA4',
  ],
  availableCompanies: [
    'facebook',
    'instagram',
    'spotify',
    'google',
    'twitter',
    'github',
  ],
  stripe: {
    api_key: process.env.STRIPE_API_KEY || 'pk_test_ylpuzm5ApXgERtfEpxjyHBH1',
  },
};
