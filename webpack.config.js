const webpack = require('webpack')

module.exports = {
  devtool: 'inline-source-map',
  entry: './js/main.js',
  output: {
    filename: '../assets/javascript/party.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      PARTY_API: 'http://app.local:3005'
    })
  ]
}
