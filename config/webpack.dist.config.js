const commons              = require("./constants");
const webpack              = require("webpack");
const UglifyJsPlugin       = require("webpack/lib/optimize/UglifyJsPlugin");
const DefinePlugin         = require("webpack/lib/DefinePlugin");
const {ForkCheckerPlugin} = require("awesome-typescript-loader");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const plugins = [
  commons.addDefaultContextReplacementPlugin(),
  new webpack.ProgressPlugin(),
  new ForkCheckerPlugin(),
  new DefinePlugin({
    ENV: JSON.stringify(process.env.NODE_ENV || "production")
  }),
  new webpack.NoErrorsPlugin(),
  new UglifyJsPlugin({
    beautify: false,
    comments: false
  })
];

const noAnalyzePluginConfig = process.env.NO_ANALYZE_PLUGIN;
// In this case, the example dist server fires up, thus, we should not block that one here...
if (noAnalyzePluginConfig !== "true") {
  plugins.push(new BundleAnalyzerPlugin({analyzerPort: 5000}));
}

module.exports = {
  entry: commons.root("src/main.ts"),
  output: {
    path: commons.root("dist"),
    filename: "bundle.min.js"
  },
  devtool: false,
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
  plugins: plugins,
  node: commons.nodeConfig
};