process.env.NODE_ENV = process.env.NODE_ENV || "development";

const webpack = require("webpack");
const fs = require("fs-extra");
const yargs = require("yargs");

const paths = require("../config/paths");
const compileTranslations = require("./translations").compile;
const watchTranslations = require("./translations").watch;
const dllConfig = require("../config/webpack/dll");
const devConfig = require("../config/webpack/dev");
const formatUtil = require("./util/formatUtil");
const devOptions = require("../config/dev.config")(yargs.argv);

const writer = process.stdout.write.bind(process.stdout);

formatUtil.cls();
writer(formatUtil.formatInfo("Starting development environment...\n"));

function info(str) {
  writer(`${formatUtil.formatInfo(str)}\n`);
}

function cleanTmp() {
  info("Clearing temp folder...");
  return fs.emptyDir(paths.devTmp);
}

function buildDlls() {
  info("Creating development DLLs...");
  const dllCompiler = webpack(dllConfig);
  return new Promise((resolve, reject) => {
    dllCompiler.run(err => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });
  });
}

function handleTranslations() {
  info("Compiling translations...");
  return compileTranslations(
    "src/**/*.i18n.yml",
    "src/generated/translations.ts"
  );
}

function handleWatchTranslations() {
  return new Promise(resolve => {
    info("Watching translations for changes...");
    const translationsWatcher = watchTranslations(
      "src/**/*.i18n.yml",
      "src/generated/translations.ts"
    );

    translationsWatcher.on("ready", () => resolve(translationsWatcher));
  });
}

function startServer(translationsWatcher) {
  info("Starting development server...");
  const WebpackDevServer = require("webpack-dev-server");
  const addDevServerEntryPoints = require("webpack-dev-server/lib/util/addDevServerEntrypoints");
  const devServerConfig = require("../config/webpack/dev-server");
  const { DEFAULT_PORT, HOST } = require("../config/hostInfo");

  info("Build config in use: " + JSON.stringify(devOptions, null, 4));

  const config = devConfig(devOptions);
  const devServerConfigBuilt = devServerConfig(
    config.output.publicPath,
    DEFAULT_PORT,
    devOptions.isHot
  );

  addDevServerEntryPoints(config, devServerConfigBuilt);

  const compiler = webpack(config);
  const devServer = new WebpackDevServer(compiler, devServerConfigBuilt);

  devServer.listen(DEFAULT_PORT, HOST, err => {
    if (err) {
      return console.error(err);
    }
  });

  ["SIGINT", "SIGTERM"].forEach(sig => {
    process.on(sig, () => {
      translationsWatcher.close();
      devServer.close();
      process.exit();
    });
  });
}

Promise.resolve()
  .then(cleanTmp)
  .then(buildDlls)
  .then(handleTranslations)
  .then(handleWatchTranslations)
  .then(startServer);
