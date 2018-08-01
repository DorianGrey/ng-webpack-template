const fs = require("fs-extra");
const glob = require("globby");

const gzipSize = require("./gzipsize");
const getRelativeChunkName = require("./getRelativeChunkName");
const relevantSizeComparisonRegex = /\.(js|css|json|webmanifest)$/;

function determineFileSizes(buildFolder) {
  const globbed = glob.sync(["**/*.{js,css,json,webmanifest}"], {
    cwd: buildFolder,
    absolute: true
  });

  const sizes = globbed.reduce((result, fileName) => {
    const contents = fs.readFileSync(fileName);
    const key = getRelativeChunkName(buildFolder, fileName);
    const originalSize = fs.statSync(fileName).size;
    result[key] = {
      original: originalSize,
      gzip: gzipSize(contents)
    };
    return result;
  }, {});

  return { root: buildFolder, sizes };
}

module.exports = {
  determineFileSizes,
  relevantSizeComparisonRegex
};
