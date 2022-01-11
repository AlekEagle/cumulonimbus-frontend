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
    appleMobileWebAppStatusBarStyle: 'black',
    iconPaths: {
      favicon32: 'assets/images/icons/favicon-32x32.png',
      favicon16: 'assets/images/icons/favicon-16x16.png'
    }
  }
};
