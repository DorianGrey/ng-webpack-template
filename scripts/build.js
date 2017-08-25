process.env.NODE_ENV = "production";

const chalk = require("chalk");
const webpack = require("webpack");
const fs = require("fs-extra");
const merge = require("webpack-merge");
const yargs = require("yargs");

const compileTranslations = require("../dev/translations").compile;
const paths = require("../config/paths");
const commonConfig = require("../config/webpack/_common.config");
const prodConfig = require("../config/webpack/_production.config");
const buildConfigFactory = require("../config/build.config");

const formatUtil = require("./util/formatUtil");
const formatWebpackMessages = require("./util/formatWebpackMessages");
const statsFormatter = require("./util/statsFormatter");
const printFileSizes = require("./util/printFileSizes");
const printPreviewInformation = require("./util/printPreviewInformation");

const writer = process.stdout.write.bind(process.stdout);

process.on("unhandledRejection", err => {
  logger.error(err);
  throw err;
});

const buildConfig = buildConfigFactory(yargs.argv);

function info(str) {
  writer(`${formatUtil.formatInfo(str)}\n`);
}

function handleTranslations() {
  info("Compiling translations...");
  return compileTranslations(
    "src/**/*.i18n.yml",
    "src/generated/translations.ts"
  );
}

function handleBuildSetup() {
  return new Promise((resolve, reject) => {
    let config;

    try {
      config = merge.smart(commonConfig(buildConfig), prodConfig(buildConfig));
    } catch (e) {
      return reject(e);
    }

    writer(formatUtil.formatInfo("Clearing output targets:"));
    writer("  " + chalk.bgBlue.white(buildConfig.outputDir));
    writer(", " + chalk.bgBlue.white(buildConfig.statsDir));
    writer("\n");

    Promise.all([
      fs.emptyDir(buildConfig.outputDir),
      fs.emptyDir(buildConfig.statsDir)
    ]).then(() => resolve([config, buildConfig]));
  });
}

function handleBuild(config, buildConfig) {
  return new Promise((resolve, reject) => {
    info("Building app...");
    info("Build config in use: " + JSON.stringify(buildConfig, null, 4));

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
      writer("\n");
      writer(formatUtil.formatSuccess("Build completed successfully.\n\n"));

      const jsonified = formatWebpackMessages(stats.toJson({}, true));
      const formattedStats = statsFormatter.formatStats(jsonified);

      statsFormatter.printWarnings(formattedStats.warnings);

      if (formattedStats.errors.length) {
        return reject(formattedStats.errors);
      } else {
        const hasYarn = fs.existsSync(paths.yarnLockFile);
        printFileSizes(buildConfig, stats);
        printPreviewInformation(buildConfig, hasYarn);
        resolve();
      }
    });
  });
}

// Build process via promise chaining. Steps are implemented in the separate
// functions above.
formatUtil.cls();

Promise.resolve()
  .then(handleTranslations)
  .then(handleBuildSetup)
  .then(([config, buildConfig]) => handleBuild(config, buildConfig))
  .catch(e => {
    writer(formatUtil.formatError("Build failed.\n"));
    writer(formatUtil.formatError(e) + "\n");
    process.exit(1);
  });
