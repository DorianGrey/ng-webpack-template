process.env.NODE_ENV = "production";

const chalk = require("chalk");
const path = require("path");
const webpack = require("webpack");
const fs = require("fs-extra");
const glob = require("globby");

const compileTranslations = require("./translations").compile;
const paths = require("../config/paths");
const { buildLog, log } = require("../config/logger");
const prodConfig = require("../config/webpack/prod");
const buildConfig = require("../config/build.config").parseFromCLI();

const determineFileSizesBeforeBuild = require("./util/determineFileSizesBeforeBuild")
  .determineFileSizes;
const formatUtil = require("./util/formatUtil");
const formatWebpackMessages = require("./util/formatWebpackMessages");
const statsFormatter = require("./util/statsFormatter");
const printFileSizes = require("./util/printFileSizes");
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

    let previousFileSizes;
    try {
      previousFileSizes = determineFileSizesBeforeBuild(buildConfig.outputDir);
    } catch (e) {
      log.error(
        `Determining file sizes before build failed, due to ${e}, going ahead with empty object.`
      );
      previousFileSizes = {
        root: buildConfig.outputDir,
        sizes: {}
      };
    }

    buildLog.await(
      `Clearing output targets: ${chalk.bgBlue.white(
        buildConfig.outputDir
      )}, ${chalk.bgBlue.white(buildConfig.statsDir)}`
    );
    Promise.all([
      fs.emptyDir(buildConfig.outputDir),
      fs.emptyDir(buildConfig.statsDir)
    ]).then(() => resolve([config, buildConfig, previousFileSizes]));
  });
}

function handleCopyStatics(config, buildConfig) {
  buildLog.await("Copying non-referenced static files...");
  const filter = file =>
    file !== paths.appHtml && file !== paths.serviceWorkerScriptSrc;

  fs.copySync(paths.appPublic, buildConfig.outputDir, {
    dereference: true,
    filter
  });
}

function determineStaticAssets() {
  // Determine copied paths, and add the generated service worker stuff as well
  // used for properly generating an output.
  const globs = [
    paths.appPublic + "/**/*",
    `!${paths.appPublic}/index.{ejs,html}`,
    `!${paths.serviceWorkerScriptSrc}`
  ];

  const staticAssets = glob
    .sync(globs)
    .map(p => path.relative(paths.appPublic, p));

  return staticAssets;
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
      buildLog.success("Build completed successfully.");

      return resolve(stats);
    });
  });
}

function printStatistics(previousFileSizes, buildConfig, stats, staticAssets) {
  return new Promise((resolve, reject) => {
    const jsonStats = stats.toJson({}, true);
    const formattedStats = formatWebpackMessages(jsonStats);
    statsFormatter.printWarnings(formattedStats.warnings);
    if (formattedStats.errors.length) {
      return reject(formattedStats.errors);
    } else {
      const hasYarn = fs.existsSync(paths.yarnLockFile);
      log.note(`Build hash: ${jsonStats.hash}`);
      printFileSizes(previousFileSizes, buildConfig, stats, staticAssets);
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
  const [config, buildConfig, previousFileSizes] = await handleBuildSetup();
  handleCopyStatics(config, buildConfig);
  const staticAssets = determineStaticAssets();
  const stats = await handleBuild(config, buildConfig);
  return printStatistics(previousFileSizes, buildConfig, stats, staticAssets);
}

build().catch(e => {
  log.error("Build failed.");
  log.error(e);
  process.exit(1);
});
