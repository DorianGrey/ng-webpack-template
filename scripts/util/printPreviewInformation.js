"use strict";

const chalk = require("chalk");
const path = require("path");
const { kebabCase } = require("lodash");

const formatUtil = require("./formatUtil");
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

  process.stdout.write(
    formatUtil.formatNote(
      `Use ${chalk.cyan(serveMessage)} to preview your production build.\n\n`
    )
  );
  process.stdout.write(
    formatUtil.formatNote(
      `Both a HTML and a JSON report about the generated bundles were generated to ${chalk.cyan(
        buildConfig.outputDir + path.sep
      )}. These are useful to analyze your bundles' sizes.\n\n`
    )
  );
}

module.exports = printPreviewInformation;
