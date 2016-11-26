const fs    = require("fs");
const path  = require("path");
const _     = require("lodash");
const utils = require("./utils");

const defaultParams = {
  baseHref: "/"
};

function handleFileCreation(srcFileName, targetFileName, params, rootSubFolder) {
  targetFileName = targetFileName || "index.html";
  params         = _.assign({}, defaultParams, params);
  return utils.readFile(srcFileName)
    .then(content => {
      const template = _.template(content);
      const result   = template(params);
      return utils.writeFile(path.resolve(__dirname, "..", rootSubFolder, targetFileName), result);
    });
}

exports.dev = (srcFileName, targetFileName, params) => {
  return handleFileCreation(srcFileName, targetFileName, params, ".tmp");
};

exports.dist = (srcFileName, targetFileName, params) => {
  return handleFileCreation(srcFileName, targetFileName, params, "dist");
};

exports.distAot = (srcFileName, targetFileName, params) => {
  return handleFileCreation(srcFileName, targetFileName, params, "dist-aot");
};