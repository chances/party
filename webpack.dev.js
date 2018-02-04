const webpack = require('webpack')
const merge = require('webpack-merge')

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const common = require('./webpack.common.js')

module.exports = merge(common, {
  devtool: 'inline-source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tslint: false,
      watch: ['./ts']
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      PARTY_API: 'http://10.0.0.20:3005'
    })
  ]
})
