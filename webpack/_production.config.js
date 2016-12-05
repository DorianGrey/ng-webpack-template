const {NoErrorsPlugin}      = require("webpack");
const UglifyJsPlugin        = require("webpack/lib/optimize/UglifyJsPlugin");
const OccurrenceOrderPlugin = require("webpack/lib/optimize/OccurrenceOrderPlugin");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ExtractTextPlugin    = require("extract-text-webpack-plugin");
const {root}               = require("./constants");

module.exports = function (useAnalyzePlugin) {
  const plugins = [
    new NoErrorsPlugin(),
    new OccurrenceOrderPlugin(true),
    new UglifyJsPlugin({
      beautify: false,
      comments: false
    }),
    new ExtractTextPlugin("[name].[chunkhash].css")
  ];
  if (useAnalyzePlugin) {
    plugins.push(new BundleAnalyzerPlugin({analyzerPort: 5000}));
  }

  return {
    output: {
      path: root("dist"),
      filename: "bundle.[hash].js",
      chunkFilename: "[id].bundle.[chunkhash].js"
    },
    devtool: false,
    plugins: plugins
  };
};