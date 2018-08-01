const path = require("path");

function getRelativeChunkName(buildFolder, fileName) {
  // TODO: We need to simplify this using path manipulations ...
  // Enforce unix version to be able to properly handle everything else ...
  const unixedBuildFolder = buildFolder.split(path.sep).join("/");

  let unixedFileName = fileName.split(path.sep).join("/");

  // Replacing by relative path is more stable, but not always usable regarding
  // provided relative file names...
  // In case `fileName` is an absolute path, using `path.relative` is favorable,
  // since it also avoids problems with potentially leading path separators.
  if (path.isAbsolute(unixedFileName)) {
    unixedFileName = path.relative(unixedBuildFolder, unixedFileName);
  } else {
    unixedFileName = unixedFileName.replace(unixedBuildFolder, "");
  }

  return unixedFileName.replace(
    /\/?(.*)(\.[0-9a-f]{8,})(\.chunk)?(\.js|\.css|\.json|\.webmanifest)/,
    (match, p1, p2, p3, p4) => p1 + p4
  );
}

module.exports = getRelativeChunkName;
