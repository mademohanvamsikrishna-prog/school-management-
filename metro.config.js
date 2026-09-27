const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.transformer.unstable_workerThreads = true;

module.exports = config;
