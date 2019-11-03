const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js"
  },
  output: {
    filename: "[name].[contenthash].js",
    publicPath: "./"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: "babel-loader" }]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },
      {
        test: /\.s(c|a)ss$/,
        exclude: /node_modules/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "sass-loader" }]
      },
      {
        test: /\.(jpg|png|bmp|gif)$/,
        exclude: /node_modules/,
        use: [{ loader: "file-loader" }]
      },
      {
        test: /\.(mp3)$/,
        exclude: /node_modules/,
        use: [{ loader: "file-loader" }]
      },
      {
        test: /\.typeface$/,
        exclude: /node_modules/,
        use: [{ loader: "file-loader" }],
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html"
    })
  ]
};
