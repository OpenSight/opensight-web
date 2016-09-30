var webpack = require('webpack');

module.exports = {
  entry: {
    "live": "./wx/live/src/js/live.js"
  },
  output: {
    path: __dirname + '/wx/live/dist/',
    filename: "[name].js"
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: "style!css"
    }],
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel' // 'babel-loader' is also a legal name to reference
    }]
  }
};
