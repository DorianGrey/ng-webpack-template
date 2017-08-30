const paths = require("../../paths");

/*
 * Include polyfills or mocks for various node stuff
 * Description: Node configuration
 *
 * See: https://webpack.github.io/docs/configuration.html#node
 */
exports.NODE_CONFIG = {
  global: true,
  crypto: "empty",
  process: true,
  module: false,
  clearImmediate: false,
  setImmediate: false
};

// These packages have problems with their source-maps.
// If any other packages have - just reference them here in the same style.
exports.EXCLUDE_SOURCE_MAPS = [
  // these packages have problems with their sourcemaps
  paths.resolveApp("node_modules/@angular"),
  paths.resolveApp("node_modules/rxjs")
];

/** A list of file extensions that may be tried resolved automatically by webpack
 * in case you did not provide them explicitly.
 * Add others here if that is required, but take care that this may slow down the
 * compilation process, since the attempts are executed in the order their corresponding
 * extensions are listed here.
 */
exports.DEFAULT_RESOLVE_EXTENSIONS = [".ts", ".js", ".json"];

exports.PERFORMANCE_OPTIONS = {
  // Size warnings are created in a custom configurable way, thus they are disabled here.
  hints: false
};
