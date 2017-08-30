/**
 * Helper function to ensure that the provided path ends with a / or not,
 * depending on the requirements.
 *
 * @param path {String} The path to check for.
 * @param needsSlash {Boolean} Indicated whether it is required to have a trailing slash or not.
 * @return {String} The provided value if it already satisfies the "must (not) have" condition,
 *                  or the fixed string otherwise.
 */
function ensureEndingSlash(path, needsSlash) {
  const hasSlash = path.endsWith("/");
  if (hasSlash && !needsSlash) {
    return path.slice(0, -1);
  } else if (!hasSlash && needsSlash) {
    return `${path}/`;
  } else {
    return path;
  }
}

module.exports = {
  ensureEndingSlash
};
