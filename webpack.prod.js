const webpack = require('webpack')
const merge = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true,
    sideEffects: false,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    })
  ]
})
