const path    = require("path");
const webpack = require("webpack");
const commons = require("./constants");

module.exports = {
  entry: {
    polyfills: [
      // Webpack polyfills
      "sockjs-client",
      "@angularclass/hmr",
      "querystring-es3",
      "strip-ansi",
      "url",
      "punycode",
      "events",
      "webpack-dev-server/client/socket.js",
      "webpack/hot/emitter.js",
      // Libs.
      "ts-helpers",
      "zone.js",
      "core-js/es6/reflect",
      "core-js/es7/reflect",
      "core-js/client/shim",
      "zone.js/dist/zone",
      "zone.js/dist/long-stack-trace-zone"
    ],
    vendor: [
      // List required libs here.
      "@angular/common",
      "@angular/compiler",
      "@angular/core",
      "@angular/forms",
      "@angular/http",
      "@angular/platform-browser",
      "@angular/platform-browser-dynamic",
      "@angular/router",
      "@ngrx/core",
      "@ngrx/store",
      "immutable",
      "lodash",
      "ng2-translate",
      "rxjs",
      "rxjs/add/operator/take",
      "rxjs/add/operator/do",
      "rxjs/Observable"
    ]
  },
  output: {
    path: commons.root(".tmp"),
    filename: "[name].dll.js",
    library: "[name]"
  },
  resolve: {
    extensions: commons.DEFAULT_RESOLVE_EXTENSIONS
  },
  module: {
    rules: [
      commons.RULE_LIB_SOURCE_MAP_LOADING,
      commons.RULE_TS_LOADING,
      commons.RULE_HTML_LOADING
    ]
  },
  plugins: [
    commons.addDefaultContextReplacementPlugin(),
    new webpack.DllPlugin({
      name: "[name]",
      path: commons.root(".tmp/[name]-manifest.json"),
    })
  ],

  node: commons.NODE_CONFIG
};