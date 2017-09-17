const webpack = require('webpack')

module.exports = {
  devtool: 'inline-source-map',
  entry: './ts/main.tsx',
  output: {
    filename: '../assets/javascript/party.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      PARTY_API: 'http://app.local:3005'
    })
  ]
}
