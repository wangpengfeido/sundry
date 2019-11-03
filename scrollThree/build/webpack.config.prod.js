const path = require("path");
const webpackMerge = require("webpack-merge");

const baseConfig = require("./webpack.config.base.js");

module.exports = webpackMerge(baseConfig, {
  output:{
    path: path.resolve(__dirname, "../dist")
  },
  mode: "development"
});
