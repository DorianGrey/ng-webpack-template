"use strict";

const camelCase     = require("lodash/camelCase");
const path          = require("path");
const program       = require("commander");
const logger        = require("log4js").getLogger("create-index-template");
const indexTemplate = require("../dev/index-template");

program
  .usage('[options] <type>')
  .option("-i, --input <file>", "The input file name")
  .option("-o, --output <file>", "The output file name")
  .parse(process.argv);

// TODO: Support some params ... and be more flexible in general.

program.type = camelCase(program.args[0]);

// TODO: This validation thing should be easier...
if (!(program.type in indexTemplate)) {
  logger.error("Type must be one of:", Object.keys(indexTemplate));
}

const targetFunction = indexTemplate[program.type];
targetFunction(
  path.resolve(__dirname, "..", "src", program.input || `index.${program.type}.html`),
  program.output || null,
  {}
)
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error("An error occurred while creating the destination template:", err);
    process.exit(err);
  });
