const checkVersionPlugin = require('checkversionplugin')

module.exports = {
  publicPath: '/portal',
  configureWebpack: {
    plugins: [
      new checkVersionPlugin({ duration: 60000 })
    ]
  }
}


