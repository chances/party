const webpack = require('webpack')
const merge = require('webpack-merge')

var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const common = require('./webpack.common.js')

class BrowserSyncPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('BrowserSyncPlugin', compilation => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tap(
        'BrowserSyncPlugin',
        data => {
          data.html += '<script defer id="__bs_script__">//<![CDATA[\n' +
            '  document.write("<script async src=\'http://HOST:3000/browser-sync/browser-sync-client.js?v=2.18.12\'><\\/script>".replace("HOST", location.hostname));\n' +
            '//]]></script>\n'
        }
      )
    })
  }
}

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: [
        { loader: 'cache-loader' },
        {
          loader: 'thread-loader',
          options: {
            // there should be 1 cpu for the fork-ts-checker-webpack-plugin
            workers: require('os').cpus().length - 1,
          },
        },
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            happyPackMode: true,
          }
        }
      ]
    }]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tslint: false,
      watch: ['./ts']
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      PARTY_API: 'http://10.0.0.20:3005'
    }),
    new BrowserSyncPlugin(),
  ]
})
