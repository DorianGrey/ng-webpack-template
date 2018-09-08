const path = require("path");

function getRelativeChunkName(buildFolder, fileName) {
  // Replacing by relative path is more stable, but not always usable regarding
  // provided relative file names...
  // In case `fileName` is an absolute path, using `path.relative` is favorable,
  // since it also avoids problems with potentially leading path separators.
  const targetFileName = path.isAbsolute(fileName)
    ? path.relative(buildFolder, fileName)
    : fileName.replace(buildFolder, "");

  const filenameWithoutHash = targetFileName.replace(
    /\/?(.*)(\.[0-9a-f]{8,})(\.chunk)?(\.js|\.css|\.json|\.webmanifest)/,
    (match, p1, p2, p3, p4) => p1 + p4
  );

  return path.normalize(filenameWithoutHash);
}

module.exports = getRelativeChunkName;
