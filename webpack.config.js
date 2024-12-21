const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'development', // or 'production'

  entry: './src/app.ts', // Your entry TypeScript file
  target: 'node', // Target Node.js
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve .ts files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/config/serviceConfig.json',
          to: 'config/serviceConfig.json',
        },
      ],
    }),
  ],
  externals: [require('webpack-node-externals')()], // Exclude node_modules from bundle
}
