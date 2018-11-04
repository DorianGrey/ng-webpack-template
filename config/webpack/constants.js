/**
 * A list of file extensions that may be tried resolved automatically by webpack
 * in case you did not provide them explicitly.
 * Add others here if that is required, but take care that this may slow down the
 * compilation process, since the attempts are executed in the order their corresponding
 * extensions are listed here.
 *
 */
exports.DEFAULT_RESOLVE_EXTENSIONS = [".ts", ".js", ".json"];

exports.NODE_CONFIG = {
  global: true,
  crypto: "empty",
  process: true,
  module: false,
  clearImmediate: false,
  setImmediate: false
};
