const path = require('path')
const webpack = require('webpack')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')

// TODO: Investigate Code Splitting
// https://webpack.js.org/guides/code-splitting/

module.exports = {
  entry: './ts/main.ts',
  output: {
    filename: 'party.js',
    path: path.resolve(__dirname, '../assets/javascript'),
    publicPath: '/assets/javascript/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '../../party/index.html',
      template: 'template.html',
      minify: false,
      showErrors: false,
    }),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    })
  ],
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  }
}
