"use strict";

const _       = require("lodash");
const program = require("commander");
const logger  = require("log4js").getLogger("lint-scripts");

const utils       = require("../dev/utils");
const lintScripts = require("../dev/scripts").lint;

program
  .usage("[options] <files-glob>")
  .option("-w, --watch", "Watch the scripts")
  .option("-e, --exclude <files-glob>", "Exclude pattern")
  .option("-t, --typecheck", "Perform full type check (takes quite long!)")
  .parse(process.argv);

program.files = program.args[0];

const errorCategories = ["warning", "error"]; // warn = "warning" in config file
logger.warning        = logger.warn;

const printErrors = e => {

  if (e.code === "ELINT") {
    errorCategories.forEach(category => {
      if (e[category] > 0) {
        let textPrefix;

        const failuresForCategory = e.failures
          .filter(f => f.ruleSeverity === category)
          .map(f => f.text)
          .join("\n");

        if (e[category] === 1) {
          textPrefix = `There is ${e[category]} linting ${category}:`
        } else {
          textPrefix = `There are ${e[category]} linting ${category}s:`
        }
        logger[category](textPrefix + "\n" + failuresForCategory + "\n");
      }
    });
  } else {
    logger.error(e.stack, "\n");
  }
};

utils.getFiles(program.files, {ignore: program.exclude})
  .then(files => lintScripts(files, program.typecheck))
  .then(
    () => logger.info("No linting errors\n"),
    e => {
      printErrors(e);
      if (!program.watch) {
        process.exit(1);
      }
    }
  );

if (program.watch) {
  const watch = require("../dev/watch");
  watch(program.files, files => {
    lintScripts(files).then(
      () => logger.info("No linting errors\n"),
      printErrors
    )
  }, {events: ["change", "unlink"]});
}