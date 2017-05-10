const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/ngDigestAnalytics.js',
    library: 'ng-digest-analytics',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader'
      }
    }]
  },
  externals: {
    'angular': 'angular'
  }
};
