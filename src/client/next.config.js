// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require('next-pwa')({
  dest: 'public',
});
const pwaConfig = withPWA({
  swcMinify: true,
});
module.exports = {
  // distDir: '../../.next',
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  eslint: {
    dirs: ['src/client'], // https://github.com/thisismydesign/nestjs-starter/issues/82
  },
  ...pwaConfig,
};
