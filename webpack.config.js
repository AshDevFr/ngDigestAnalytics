const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/ngDigestAnalytic.js',
    library: 'ng-digest-analytic',
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
}
