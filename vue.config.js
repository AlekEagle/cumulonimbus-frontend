let manifestJSON = require('./public/manifest.json');

module.exports = {
  configureWebpack: {
    devtool: 'source-map'
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
    },
    themeColor: manifestJSON.themeColor,
    name: manifestJSON.short_name,
    msTileColor: manifestJSON.background_color,
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: '#000',
    iconPaths: {
      favicon32: 'assets/images/icons/favicon-32x32.png',
      favicon16: 'assets/images/icons/favicon-16x16.png',
      appleTouchIcon: 'assets/images/icons/apple-touch-icon-152x152.png',
      msTileImage: 'assets/images/icons/msapplication-icon-144x144.png',
      maskIcon: null
    }
  }
};
