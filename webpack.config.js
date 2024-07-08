const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              [ '@babel/plugin-transform-react-jsx' ]
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: [ 'style-loader', 'css-loader' ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [ 'style-loader', 'css-loader', 'sass-loader' ],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new Dotenv({
      systemvars: process.env.NODE_ENV === 'production'
    })
  ],
  devtool: 'source-map',
};
