const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'remote/[name].min.js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'remote/[name].min.css'
    })
  ]
});
