const {
        DefinePlugin,
        DllReferencePlugin,
        ProgressPlugin
      }                   = require("webpack");
const {ForkCheckerPlugin} = require("awesome-typescript-loader");
const commons             = require("./constants");
const devServerConfig     = require("./dev-server.config");

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
      commons.RULE_MAIN_SASS_LOADING(true),
      commons.RULE_COMPONENT_SASS_LOADING
    ]
  },
  plugins: [
    // See https://github.com/AngularClass/angular2-webpack-starter/issues/993
    // and https://github.com/angular/angular/issues/11625
    commons.getDefaultContextReplacementPlugin(),
    new ProgressPlugin(),
    new ForkCheckerPlugin(),
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV || "development")
    }),
    new DllReferencePlugin({
      context: ".",
      manifest: require(commons.root(".tmp/polyfills-manifest.json"))
    }),
    new DllReferencePlugin({
      context: ".",
      manifest: require(commons.root(".tmp/vendor-manifest.json"))
    }),
    commons.getHtmlTemplatePlugin(true),
    commons.getLoaderOptionsPlugin(true)
  ],

  node: commons.NODE_CONFIG,
  devServer: devServerConfig
};