const path        = require("path");
const {DllPlugin} = require("webpack");
const commons     = require("./constants");

/**
 * This config is used to build so-called `DLLs`, `dynamically linked libraries.
 * It's not the same as it is in languages like C(++) - it's just a simple way to
 * throw multiple libraries together without performing any further checks if they
 * are (even partially) used, which other libs they might reference, etc.
 * This is unfortunate for production builds, since these care about bundle size,
 * which - the other way round - requires correct and detaild dependency trees. However,
 * creating this tree might be a rather expensive task if you're using many and/or complex
 * libraries.
 * Thus, for dev-mode, this is somewhat ideal to have a version to just throw these together
 * and just reference the DLL from your dev-bundle. This improves rebuild times by quite a
 * margin - in my case, they got reduced by more that 60% (!).
 */
module.exports = {
  entry: {
    polyfills: [
      // Webpack polyfills and utilities
      "sockjs-client",
      "querystring-es3",
      "strip-ansi",
      "url",
      "punycode",
      "events",
      "webpack-dev-server/client/socket.js",
      "webpack/hot/emitter.js",
      // Library polyfills and utilities that do not belong to
      // a particular libary.
      "tslib",
      "zone.js",
      "core-js/es6/reflect",
      "core-js/es7/reflect",
      "core-js/client/shim",
      "zone.js/dist/zone",
      "zone.js/dist/long-stack-trace-zone",
      "@angularclass/hmr"
    ],
    vendor: [
      /**
       * List required libs here.
       * Note: If you add a library and forget to add it to this list,
       * don't worry, you dev build will still work. However, you will
       * lose rebuild performance.
       */
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
      "lodash-es",
      "@ngx-translate/core",
      "rxjs"
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
    commons.getDefaultContextReplacementPlugin(),
    new DllPlugin({
      name: "[name]",
      path: commons.root(".tmp/[name]-manifest.json"),
    })
  ],
  performance: commons.getPerformanceOptions(false),
  node: commons.NODE_CONFIG
};