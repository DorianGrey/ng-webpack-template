process.env.NODE_ENV = "production";

const chalk = require("chalk");
const path = require("path");
const webpack = require("webpack");
const fs = require("fs-extra");
const yargs = require("yargs");
const glob = require("globby");

const compileTranslations = require("./translations").compile;
const paths = require("../config/paths");
const prodConfig = require("../config/webpack/prod");
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
      config = prodConfig(buildConfig);
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

function handleCopyStatics(config, buildConfig) {
  writer(formatUtil.formatInfo("Copying non-referenced static files...\n"));
  fs.copySync(paths.appPublic, buildConfig.outputDir, {
    dereference: true,
    filter: file => file !== paths.appHtml
  });
  return [config, buildConfig];
}

function handleBuild(config, buildConfig) {
  return new Promise((resolve, reject) => {
    info("Building app...");
    info("Build config in use: " + JSON.stringify(buildConfig, null, 4));

    // Determine copied paths, and add the generated service worker stuff (once it's added) as well
    // used for properly generating an output.
    const staticAssets = glob
      .sync([paths.appPublic + "**/*", `!${paths.appPublic}/index.{ejs,html}`])
      .map(p => path.relative(paths.appPublic, p));

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
        printFileSizes(buildConfig, stats, staticAssets);
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
  .then(([config, buildConfig]) => handleCopyStatics(config, buildConfig))
  .then(([config, buildConfig]) => handleBuild(config, buildConfig))
  .catch(e => {
    writer(formatUtil.formatError("Build failed.\n"));
    writer(formatUtil.formatError(e) + "\n");
    process.exit(1);
  });
