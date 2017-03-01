"use strict";

const fs = require("fs");
const _ = require("lodash");

const styleLint = require("stylelint");

const utils = require("../dev/utils");

const lintingConfiguration = JSON.parse(fs.readFileSync(".stylelintrc", "utf8"));

// We want to keep track of all linting errors, but don't want to lint all files on each change.
// Because of this we simply store all errors in this object.
const lintingErrors = {};

exports.lint = files =>
  Promise
    .all(files.map(file => utils.readFile(file).then(content => ({file, content}))))
    .then(fileObjs =>
      Promise.all(fileObjs.map(fileObj =>
        styleLint.lint({
          codeFilename: fileObj.file,
          code: fileObj.content,
          config: lintingConfiguration
        }).then(result => {
          if (result.errored) {
            lintingErrors[fileObj.file] = result;
          } else {
            delete lintingErrors[fileObj.file];
          }
        })))
        .then(() => {
          if (Object.keys(lintingErrors).length > 0) {
            const err = new Error("There are linting errors in the project");
            err.code = "ELINT";
            err.count = 0;
            err.output = _.map(lintingErrors, (result, file) => {
              const res = result.results[0];
              err.count += res.warnings.length;
              return res.warnings.map(warn => `${file}[${warn.line}, ${warn.column}]: ${warn.text}`).join("\n");
            }).join("\n");
            //err.count = _.values(lintingErrors).reduce((count, result) => result.failureCount + count, 0);
            throw err;
          }
        }));
