const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const package = require('./package.json')


module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.ts',
    vendor: Object.keys(package.dependencies),
    drag: './src/drag.ts',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Scrolls',
      chunks: ['vendor', 'index'],
      template: 'src/index.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'Scrolls Drag',
      chunks: ['vendor', 'drag'],
      template: 'src/drag.html',
      filename: 'drag.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  output: {
    filename: '[name].bundle.js',
    // path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
};
