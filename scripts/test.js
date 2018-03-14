"use strict";

process.env.NODE_ENV = "test";
process.env.PUBLIC_URL = "";

const fs = require("fs-extra");
const compileTranslations = require("./translations").compile;
const paths = require("../config/paths");

process.on("unhandledRejection", err => {
  throw err;
});

const jest = require("jest");
const argv = process.argv.slice(2);

const isDebug = /debug$/.test(process.env.npm_lifecycle_event);
if (isDebug) {
  argv.push("--no-watch", "--runInBand", "--no-cache", "--env=jsdom");
}
const isCi = /ci$/.test(process.env.npm_lifecycle_event) || process.env.CI;
const withCoverage = argv.indexOf("--coverage") >= 0;
const suppressWatchMode = argv.indexOf("--no-watch") >= 0;

if (!isCi && !withCoverage && !suppressWatchMode) {
  argv.push("--watch");
}

const started = withCoverage
  ? fs.emptyDir(paths.resolveApp("test-results"))
  : Promise.resolve();

started
  .then(() =>
    compileTranslations("src/**/*.i18n.yml", "src/generated/translations.ts")
  )
  .then(() => {
    jest.run(argv);
  });
