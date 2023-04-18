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
  // webpack(config) {
  //   config.plugins = config.plugins.filter((plugin) => {
  //     return plugin.constructor.name !== 'ReactFreshWebpackPlugin';
  //   });

  //   return config;
  // },
};

module.exports = process.env.NODE_ENV === 'production' ? withPWA(settings) : settings;
