const path = require('path')

class CheckVersionPlugin {
  constructor({ duration } = {}) {
    this.duration = duration || 60000
  }

  apply(compiler) {
    compiler.hooks.emit.tap('CheckVersionPlugin', (compilation) => {
      const self = this;
      const compilationHash = compilation.hash;

      // Use the configured public path or build a relative path
      let publicPath = typeof compilation.options.output.publicPath !== 'undefined'
        // If a hard coded public path exists use it
        ? compilation.mainTemplate.getPublicPath({hash: compilationHash})
        // If no public path was set get a relative url path
        : path.relative(path.resolve(compilation.options.output.path, path.dirname(self.childCompilationOutputName)), compilation.options.output.path)
          .split(path.sep).join('/');

      if (publicPath.length && publicPath.substr(-1, 1) !== '/') {
        publicPath += '/';
      }

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
    
          fetch('${publicPath}version.json', { headers: { 'Cache-control': 'no-cache'  } }).then(res => {
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

    })
    
    compiler.hooks.compilation.tap('CheckVersionPlugin', (compilation) => {
      // insert script to index.html
      let publicPath = compilation.mainTemplate.getPublicPath({hash: compilation.hash}) || '';
      if (publicPath && publicPath.substr(-1) !== '/') {
        publicPath += '/';
      }

      compilation.plugin(
        "html-webpack-plugin-before-html-processing",
        function(htmlPluginData) {
         
          let resultHTML = htmlPluginData.html.replace('</body>', `<script src="${publicPath}checkversion.js"></script></body>`);

          htmlPluginData.html = resultHTML;
        }
      );
    })
  }
}

module.exports = CheckVersionPlugin;
