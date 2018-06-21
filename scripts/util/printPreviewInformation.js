"use strict";

const chalk = require("chalk");
const path = require("path");
const { kebabCase } = require("lodash");

const { log } = require("../../config/logger");
const { getNonDefaultFields } = require("../../config/build.config");

function printPreviewInformation(buildConfig, hasYarn) {
  let serveMessage = hasYarn ? "yarn serve" : "npm run serve";
  const nonDefaultFields = getNonDefaultFields(buildConfig);
  const additionalInfoString = Object.getOwnPropertyNames(nonDefaultFields)
    .map(k => `--${kebabCase(k)} "${nonDefaultFields[k]}"`)
    .join(" ");

  if (additionalInfoString) {
    serveMessage = `${serveMessage} -- ${additionalInfoString}`;
  }

  log.note(`Use ${chalk.cyan(serveMessage)} to preview your production build.`);
  log.note(
    `Both a HTML and a JSON report about the generated bundles were generated to ${chalk.cyan(
      buildConfig.outputDir + path.sep
    )}. These are useful to analyze your bundles' sizes.`
  );
}

module.exports = printPreviewInformation;
