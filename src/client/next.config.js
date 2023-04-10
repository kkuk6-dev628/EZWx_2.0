// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require('next-pwa')({
  dest: 'public',
});
const settings = {
  // distDir: '../../.next',
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  eslint: {
    dirs: ['src/client'], // https://github.com/thisismydesign/nestjs-starter/issues/82
  },
  swcMinify: true,
};

module.exports = process.env.NODE_ENV === 'production' ? withPWA(settings) : settings;
