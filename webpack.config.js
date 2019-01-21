const path = require('path');

module.exports = {
  entry: ['./src/index.js'],
  devtool: process.env.BUILD_ENV !== 'production' ? 'inline-source-map' : undefined,
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};