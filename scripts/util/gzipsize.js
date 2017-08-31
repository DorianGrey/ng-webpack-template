const zlib = require("zlib");

function gzipSize(src, gzipOpts) {
  return zlib.gzipSync(src, gzipOpts).length;
}

module.exports = gzipSize;
