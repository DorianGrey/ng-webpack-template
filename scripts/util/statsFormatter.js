"use strict";

const { log } = require("../../config/logger");

function printErrors(errors) {
  if (errors.length) {
    const eCnt = errors.length;
    log.error(
      `There ${eCnt === 1 ? "is" : "are"} ${eCnt} build error${
        eCnt === 1 ? "" : "s"
      }:`
    );
    errors.forEach(err => {
      log.error(err);
    });
  }
}

function printWarnings(warnings) {
  if (warnings.length) {
    const eCnt = warnings.length;
    log.warn(
      `There ${eCnt === 1 ? "is" : "are"} ${eCnt} build warning${
        eCnt === 1 ? "" : "s"
      }:`
    );
    warnings.forEach(warn => {
      log.warn(warn);
    });
  }
}

module.exports = {
  printWarnings,
  printErrors
};
