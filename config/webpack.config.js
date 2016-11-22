const path                = require("path");
const webpack             = require("webpack");
const DefinePlugin        = require("webpack/lib/DefinePlugin");
const {ForkCheckerPlugin} = require("awesome-typescript-loader");
const commons             = require("./constants");

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
    })
  ],

  node: commons.nodeConfig,
  // For further config see here: https://github.com/webpack/docs/wiki/webpack-dev-server#api
  devServer: {
    port: 9987,
    historyApiFallback: true,
    contentBase: [
      commons.root("src"),
      commons.root(".tmp"),
      commons.root("")
    ],
    // TODO: Maybe add more of the options mentioned here: https://github.com/webpack/webpack-dev-server/issues/68#issuecomment-75323551
    stats: {
      colors: true,
      chunks: false
    }
  }
};