const path    = require("path");
const webpack = require("webpack");

const rootDir = path.resolve(__dirname, "..");

function root(relativPath) {
  "use strict";
  return path.resolve(rootDir, relativPath);
}

/*
 * Include polyfills or mocks for various node stuff
 * Description: Node configuration
 *
 * See: https://webpack.github.io/docs/configuration.html#node
 */
const nodeConfig = {
  global: true,
  crypto: 'empty',
  process: true,
  module: false,
  clearImmediate: false,
  setImmediate: false
};

const EXCLUDE_SOURCE_MAPS = [
  // these packages have problems with their sourcemaps
  root("node_modules/@angular"),
  root("node_modules/rxjs")
];

const RULE_LIB_SOURCE_MAP_LOADING = {
  test: /\.js$/,
  loader: "source-map-loader",
  exclude: [EXCLUDE_SOURCE_MAPS]
};

const RULE_TS_LOADING = {
  test: /\.tsx?$/,
  loaders: [
    "@angularclass/hmr-loader?pretty=true",
    "awesome-typescript-loader",
    "angular2-template-loader",
    "angular2-router-loader"
  ]
};

const RULE_HTML_LOADING = {
  test: /\.html/,
  loader: "raw-loader",
  exclude: [root("src/index.html")]
};

const RULE_MAIN_SASS_LOADING = {
  test: /main\.scss$/,
  loaders: ["style-loader", "css-loader", "sass-loader"]
};

const RULE_SASS_LOADING = {
  test: /\.scss$/,
  loaders: ["to-string-loader", "css-loader", "sass-loader"],
  exclude: [/main\.scss$/]
};

const DEFAULT_RESOLVE_EXTENSIONS = [".ts", ".js", ".json"];

function addDefaultContextReplacementPlugin(src) {
  src = src || "src";
  return new webpack.ContextReplacementPlugin(
    /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
    root(src)
  )
}

module.exports = {
  root: root,
  nodeConfig: nodeConfig,
  EXCLUDE_SOURCE_MAPS: EXCLUDE_SOURCE_MAPS,
  RULE_LIB_SOURCE_MAP_LOADING: RULE_LIB_SOURCE_MAP_LOADING,
  RULE_TS_LOADING: RULE_TS_LOADING,
  RULE_HTML_LOADING: RULE_HTML_LOADING,
  RULE_MAIN_SASS_LOADING: RULE_MAIN_SASS_LOADING,
  RULE_SASS_LOADING: RULE_SASS_LOADING,
  DEFAULT_RESOLVE_EXTENSIONS: DEFAULT_RESOLVE_EXTENSIONS,
  addDefaultContextReplacementPlugin: addDefaultContextReplacementPlugin
};