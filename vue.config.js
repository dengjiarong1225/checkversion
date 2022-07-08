const checkVersionPlugin = require('checkversionplugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new checkVersionPlugin({ duration: 60000 })
    ]
  }
}


