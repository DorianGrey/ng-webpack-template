"use strict";

const path                    = require("path");
const _                       = require("lodash");
const {Configuration, Linter} = require("tslint");
const utils                   = require("./utils");
const logger                  = require("log4js").getLogger("lint-scripts");
const configuration           = Configuration.parseConfigFile(require("../tslint.json"));

// We want to keep track of all linting errors, but don't want to lint all files on each change.
// Because of this we simply store all errors in this object.
const lintingErrors = {};

function stripFileNamePrefixes(files) {
  const prefix = process.cwd();
  return files.map(file => file.replace(`${prefix}${path.sep}`, ""));
}

function updateErrorList(linter, fileName) {
  const lintingResult = linter.getResult();
  const failureCount  = lintingResult.warningCount + lintingResult.errorCount;
  if (failureCount > 0) {
    lintingErrors[fileName] = lintingResult;
  } else {
    delete lintingErrors[fileName];
  }
}

/**
 * Performs the real linting operation, depending on the requested type.
 *
 * Note: In case of `withTypeCheck`= true, this function will calculate the intersection of
 * the list of requested files and the list of files determined by the created linter program.
 * Regularly, this should not be a problem. However, it might become one in case of unusual project structure, so BEWARE!
 *
 * @param requestedFiles {Array}
 * @param withTypeCheck {Boolean}
 */
function performLint(requestedFiles, withTypeCheck) {

  const lintOptions = {formatter: "verbose"};

  // This rule causes bugs with default imports when using it in conjunction with the full type-check.
  configuration["rules"]["no-use-before-declare"] = !withTypeCheck;

  if (withTypeCheck) {

    const program = Linter.createProgram("tsconfig.json");
    const files   = _.intersection(requestedFiles, stripFileNamePrefixes(Linter.getFileNames(program)));

    files.forEach(file => {
      const fileContents = program.getSourceFile(file).getFullText();
      const linter       = new Linter(lintOptions, program);
      linter.lint(file, fileContents, configuration);

      updateErrorList(linter, file);
    });

    return Promise.resolve();

  } else {

    return Promise
      .all(requestedFiles.map(file => utils.readFile(file).then(content => ({file, content}))))
      .then(fileObjs => {
        for (let fileObj of fileObjs) {
          const linter = new Linter(lintOptions);
          linter.lint(fileObj.file, fileObj.content, configuration);

          updateErrorList(linter, fileObj.file);
        }
      });
  }

}

// Note: The construct below was adopted to work with TSLint > 4.0, and will NOT WORK with earlier versions!

exports.lint = (requestedFiles, withTypeCheck) => {

  return performLint(requestedFiles, withTypeCheck)
    .then(() =>
      new Promise((resolve, reject) => {
        if (Object.keys(lintingErrors).length > 0) {
          const err  = new Error("There are linting errors in the project");
          err.code   = "ELINT";
          err.failures = _.values(lintingErrors)
            .map(result => result.failures.map((failure) => {
              const pos = failure.startPosition.lineAndCharacter;
              return {
                text: `${failure.fileName}[${pos.line + 1}, ${pos.character}]: ${failure.failure} (${failure.ruleName})`,
                ruleSeverity: failure.ruleSeverity
              };
            }))
            .reduce((a, b) => a.concat(b), []);
          err.warning = _.values(lintingErrors).reduce((count, result) => result.warningCount + count, 0);
          err.error  = _.values(lintingErrors).reduce((count, result) => result.errorCount + count, 0);
          reject(err);
        } else {
          resolve();
        }
      })
    );
};