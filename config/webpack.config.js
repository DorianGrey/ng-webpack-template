const path              = require("path");
const webpack           = require("webpack");
const DefinePlugin      = require("webpack/lib/DefinePlugin");
const {ForkCheckerPlugin} = require("awesome-typescript-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const commons           = require("./constants");
const devServerConfig   = require("./dev-server.config");

module.exports = {
  entry: commons.root("src/main.ts"),
  output: {
    path: commons.root(".tmp"),
    filename: "bundle.js"
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: commons.DEFAULT_RESOLVE_EXTENSIONS
  },
  module: {
    rules: [
      commons.RULE_LIB_SOURCE_MAP_LOADING,
      commons.RULE_TS_LOADING,
      commons.RULE_HTML_LOADING,
      commons.RULE_MAIN_SASS_LOADING,
      commons.RULE_SASS_LOADING,
    ]
  },
  plugins: [
    // See https://github.com/AngularClass/angular2-webpack-starter/issues/993
    // and https://github.com/angular/angular/issues/11625
    commons.addDefaultContextReplacementPlugin(),
    new webpack.ProgressPlugin(),
    new ForkCheckerPlugin(),
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV || "development")
    }),
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: require(commons.root(".tmp/polyfills-manifest.json"))
    }),
    new webpack.DllReferencePlugin({
      context: '.',
      manifest: require(commons.root(".tmp/vendor-manifest.json"))
    }),
    new HtmlWebpackPlugin(commons.getHtmlTemplateOptions(true))
  ],

  node: commons.nodeConfig,
  devServer: devServerConfig
};