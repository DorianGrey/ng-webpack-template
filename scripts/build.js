process.env.NODE_ENV = "production";

const chalk = require("chalk");
const path = require("path");
const webpack = require("webpack");
const fs = require("fs-extra");
const yargs = require("yargs");
const glob = require("globby");
const shelljs = require("shelljs");

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
  writer(formatUtil.formatError(err) + "\n");
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
  writer(
    formatUtil.formatInfo("Copying non-referenced static files...") + "\n"
  );
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
      writer(
        formatUtil.formatSuccess("Build completed successfully." + "\n\n")
      );

      return resolve([buildConfig, stats, staticAssets]);
    });
  });
}

function handlePostBuild(buildConfig, stats, staticAssets) {
  const pa = require.resolve("workbox-sw"),
    swTargetPath = path.join(buildConfig.outputDir, path.basename(pa)),
    paMap = pa + ".map",
    swMapPath = path.join(buildConfig.outputDir, path.basename(pa) + ".map");

  fs.copySync(pa, swTargetPath, {
    dereference: true
  });
  fs.copySync(paMap, swMapPath, {
    dereference: true
  });

  // Update service-worker script to properly update its referenced Workbox.js version.
  shelljs.sed(
    "-i",
    /\$serviceWorkerLibAnchor/,
    buildConfig.publicPath + path.basename(pa),
    path.resolve(buildConfig.outputDir, "service-worker.js")
  );

  // Add the files copied from workbox to the list of statically copied files.
  staticAssets.push(
    path.relative(buildConfig.outputDir, swTargetPath),
    path.relative(buildConfig.outputDir, swMapPath)
  );

  return Promise.resolve([buildConfig, stats, staticAssets]);
}

function printStatistics(buildConfig, stats, staticAssets) {
  return new Promise((resolve, reject) => {
    const jsonified = formatWebpackMessages(stats.toJson({}, true));
    const formattedStats = statsFormatter.formatStats(jsonified);
    statsFormatter.printWarnings(formattedStats.warnings);
    if (formattedStats.errors.length) {
      return reject(formattedStats.errors);
    } else {
      const hasYarn = fs.existsSync(paths.yarnLockFile);
      printFileSizes(buildConfig, stats, staticAssets);
      printPreviewInformation(buildConfig, hasYarn);
      resolve(buildConfig);
    }
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
  .then(([buildConfig, stats, staticAssets]) =>
    handlePostBuild(buildConfig, stats, staticAssets)
  )
  .then(([buildConfig, stats, staticAssets]) =>
    printStatistics(buildConfig, stats, staticAssets)
  )
  .catch(e => {
    writer(formatUtil.formatError("Build failed." + "\n"));
    writer(formatUtil.formatError(e) + "\n");
    process.exit(1);
  });
