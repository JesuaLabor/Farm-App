// app.config.js — Dynamic Expo config that reads API_URL from environment.
// The launch script sets the API_URL env var (via localtunnel) before starting Expo.
// Access it in the app via: Constants.expoConfig.extra.apiUrl

const base = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...base.expo,
  extra: {
    // Injected by run_mobile_web_backend_locally.sh via localtunnel.
    // Falls back to the LAN IP if not set.
    apiUrl: process.env.API_URL || `http://192.168.100.164:8080`,
  },
};
