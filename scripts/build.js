process.env.NODE_ENV = "production";

const webpack = require("webpack");
const fs = require("fs-extra");

const compileTranslations = require("./translations").compile;
const paths = require("../config/paths");
const { buildLog, log } = require("../config/logger");
const prodConfig = require("../config/webpack/prod");
const buildConfig = require("../config/build.config").parseFromCLI();

const formatUtil = require("./util/formatUtil");
const printPreviewInformation = require("./util/printPreviewInformation");

process.on("unhandledRejection", err => {
  log.error(err);
  throw err;
});

function handleTranslations() {
  buildLog.await("Compiling translations...");
  return compileTranslations(
    "src/**/*.i18n.yml",
    "src/generated/translations.ts"
  );
}

function handleBuildSetup() {
  return new Promise((resolve, reject) => {
    let config;

    try {
      config = prodConfig(buildConfig);
    } catch (e) {
      return reject(e);
    }

    resolve([config, buildConfig]);
  });
}

function handleBuild(config, buildConfig) {
  return new Promise((resolve, reject) => {
    buildLog.info(
      "Build config in use: " + JSON.stringify(buildConfig, null, 4)
    );
    buildLog.await("Building app...");

    let compiler;
    try {
      compiler = webpack(config);
    } catch (e) {
      return reject(e);
    }

    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      return resolve(stats);
    });
  });
}

function printStatistics(buildConfig, stats) {
  return new Promise((resolve, reject) => {
    if (stats.hasErrors()) {
      return reject();
    } else {
      const hasYarn = fs.existsSync(paths.yarnLockFile);
      printPreviewInformation(buildConfig, hasYarn);
      resolve(buildConfig);
    }
  });
}

// Build process via promise chaining. Steps are implemented in the separate
// functions above.
async function build() {
  formatUtil.cls();
  await handleTranslations();
  const [config, buildConfig] = await handleBuildSetup();
  const stats = await handleBuild(config, buildConfig);
  return printStatistics(buildConfig, stats);
}

build().catch(e => {
  log.error("Build failed.");
  if (e) {
    log.error(e);
  }
  process.exit(1);
});
