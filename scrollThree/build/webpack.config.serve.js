const path = require("path");
const webpackMerge = require("webpack-merge");

const baseConfig = require("./webpack.config.base.js");

module.exports = webpackMerge(baseConfig, {
  output: {
    path: path.resolve(__dirname, "../dev"),
    publicPath: "/"
  },
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    port: 18000,
    open: true,
    openPage: "http://localhost:18000/index.html"
  }
});
