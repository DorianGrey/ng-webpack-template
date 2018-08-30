const cloneDeep = require("lodash").cloneDeep;

const basicUglifyOptions = {
  compress: {
    warnings: false,
    // This feature has been reported as buggy a few times, such as:
    // https://github.com/mishoo/UglifyJS2/issues/1964
    // We'll wait with enabling it by default until it is more solid.
    reduce_vars: false
  },
  output: {
    comments: false
  }
};

/**
 * Note: We need a deep copy here to avoid potential modifications
 * through the different uglification processes.
 */
function getBasicUglifyOptions() {
  return cloneDeep(basicUglifyOptions);
}

module.exports = getBasicUglifyOptions;
