process.env.NODE_ENV = process.env.NODE_ENV || "development";

const webpack = require("webpack");
const fs = require("fs-extra");

const paths = require("../config/paths");
const compileTranslations = require("./translations").compile;
const watchTranslations = require("./translations").watch;
const dllConfig = require("../config/webpack/dll");
const devConfig = require("../config/webpack/dev");
const formatUtil = require("./util/formatUtil");
const { formatMessage } = require("./util/formatWebpackMessages");
const { printErrors } = require("./util/statsFormatter");
const devOptions = require("../config/dev.config").parseFromCLI();

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
    dllCompiler.run((err, s) => {
      const stats = s.toJson({}, true);
      const hasErrors = err || (stats.errors && stats.errors.length > 0);
      if (hasErrors) {
        return reject(err || stats.errors);
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
      "src/generated/translations.ts",
      { chokidarOpts: { ignoreInitial: true } }
    );

    translationsWatcher.on("ready", () => {
      resolve(translationsWatcher);
    });
  });
}

function startServer(translationsWatcher) {
  info("Starting development server...");

  const { HOST, selectPort } = require("../config/hostInfo");

  return selectPort(devOptions.port).then(selectedPort => {
    devOptions.port = selectedPort;
    info("Build config in use: " + JSON.stringify(devOptions, null, 4));

    const WebpackDevServer = require("webpack-dev-server");
    const addDevServerEntryPoints = require("webpack-dev-server/lib/util/addDevServerEntrypoints");
    const devServerConfig = require("../config/webpack/dev-server");

    const config = devConfig(devOptions);
    const devServerConfigBuilt = devServerConfig(
      config.output.publicPath,
      selectedPort,
      devOptions.isHot
    );

    addDevServerEntryPoints(config, devServerConfigBuilt);

    const compiler = webpack(config);
    const devServer = new WebpackDevServer(compiler, devServerConfigBuilt);

    devServer.listen(selectedPort, HOST, err => {
      if (err) {
        return console.error(err);
      }
    });

    ["SIGINT", "SIGTERM"].forEach(sig => {
      process.on(sig, () => {
        translationsWatcher.close();
        devServer.close();
        process.exit(0);
      });
    });
  });
}

Promise.resolve()
  .then(cleanTmp)
  .then(handleTranslations)
  .then(buildDlls)
  .then(handleWatchTranslations)
  .then(startServer)
  .catch(err => {
    // `err` might be an array in case we provided the error list from webpack.
    if (Array.isArray(err)) {
      const formatted = err.map(message =>
        formatMessage(message, formatUtil.formatFirstLineMessage)
      );
      printErrors(formatted, writer);
    } else {
      console.error(err);
    }
    process.exit(1);
  });
