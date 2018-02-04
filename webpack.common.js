const webpack = require('webpack')

module.exports = {
  entry: './ts/main.ts',
  output: {
    filename: '../assets/javascript/party.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      }
    ]
  }
}
