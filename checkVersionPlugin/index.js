class CheckVersionPlugin {
  constructor({ duration } = {}) {
    this.duration = duration || 60000
  }
  apply(compiler) {
    compiler.hooks.compilation.tap('CheckVersionPlugin', (compilation) => {
      // create a version.json
      var versionText = `{ "version": "V${new Date().getTime()}" }`;
      compilation.assets['version.json'] = {
        source: function() {
          return versionText;
        },
        size: function() {
          return versionText.length;
        }
      };
      
      // create a autoCheck function
      var autoCheck = `
        var timer = null;
          
        function autoCheckVersionPlugin() {
          var version = localStorage.getItem('appVersion');
    
          fetch('./version.json', { headers: { 'Cache-control': 'no-cache'  } }).then(res => {
            res.json().then(json => {
              var newVersion = json.version
              if (newVersion !== version) {
                localStorage.setItem('appVersion', newVersion)
                clearInterval(timer)
                location.reload()
              }
            })
          })
        }
        timer = setInterval(autoCheckVersionPlugin, ${this.duration});
      `;
      compilation.assets['checkversion.js'] = {
        source: function() {
          return autoCheck;
        },
        size: function() {
          return autoCheck.length;
        }
      };
    
      // insert script to index.html
      compilation.plugin(
        "html-webpack-plugin-before-html-processing",
        function(htmlPluginData) {
         
          let resultHTML = htmlPluginData.html.replace('</body>', '<script src="/checkversion.js"></script></body>');

          htmlPluginData.html = resultHTML;
        }
      );
    })
  }
}

module.exports = CheckVersionPlugin;
