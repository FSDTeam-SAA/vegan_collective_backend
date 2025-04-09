const Nylas = require("nylas").default;

const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
});

const nylasConfig = {
  clientId: process.env.NYLAS_CLIENT_ID,
  redirectUri: process.env.BACKEND_URL + "/api/oauth/exchange",
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

module.exports = { nylas, nylasConfig };
