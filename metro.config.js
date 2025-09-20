const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable async require support
config.transformer.asyncRequireModulePath = require.resolve(
  'metro-runtime/src/modules/asyncRequire'
);

// Ensure async import support
config.resolver.unstable_enablePackageExports = true;

// Fix for Supabase on web
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;