process.env.NODE_ENV = process.env.NODE_ENV || "development";

const webpack = require("webpack");
const fs = require("fs-extra");

const paths = require("../config/paths");
const compileTranslations = require("./translations").compile;
const watchTranslations = require("./translations").watch;
const dllConfig = require("../config/webpack/dll");
const devConfig = require("../config/webpack/dev");
const formatUtil = require("./util/formatUtil");
const { log, buildLog } = require("../config/logger");
const { formatMessage } = require("./util/formatWebpackMessages");
const { printErrors } = require("./util/statsFormatter");
const devOptions = require("../config/dev.config").parseFromCLI();

formatUtil.cls();
buildLog.await("Starting development environment...\n");

function cleanTmp() {
  buildLog.await("Clearing temp folder...");
  return fs.emptyDir(paths.devTmp);
}

function buildDlls() {
  buildLog.await("Creating development DLLs...");
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
  buildLog.await("Compiling translations...");
  return compileTranslations(
    "src/**/*.i18n.yml",
    "src/generated/translations.ts"
  );
}

function handleWatchTranslations() {
  return new Promise(resolve => {
    buildLog.info("Watching translations for changes...");
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

async function startServer(translationsWatcher) {
  buildLog.await("Starting development server...");

  const {
    useLocalIp,
    selectPort,
    LOCAL_HOST_ADDRESS,
    PUBLIC_ADDRESS
  } = require("../config/hostInfo");
  const selectedPort = await selectPort(devOptions.port);
  devOptions.port = selectedPort;
  buildLog.info("Build config in use: " + JSON.stringify(devOptions, null, 4));

  const serve = require("webpack-serve");
  const devServerConfig = require("../config/webpack/dev-server");

  const config = devConfig(devOptions);
  const host = useLocalIp ? PUBLIC_ADDRESS : LOCAL_HOST_ADDRESS;
  const devServerConfigBuilt = devServerConfig(
    host,
    selectedPort,
    config.output.publicPath,
    devOptions.isHot
  );

  let devServer;
  try {
    devServer = serve({}, { config, ...devServerConfigBuilt });
  } catch (e) {
    log.error(e);
    process.exit(1);
  }

  const serverInstance = devServer.then(result => {
    ["SIGINT", "SIGTERM"].forEach(sig => {
      process.on(sig, () => {
        translationsWatcher.close();
        result.app.stop();
        process.exit(0);
      });

      buildLog.success(
        `Dev server available at: http://${host}:${selectedPort}...`
      );
    });
  });

  return serverInstance;
}

async function start() {
  await cleanTmp();
  await handleTranslations();
  await buildDlls();
  const translationsWatcher = await handleWatchTranslations();
  return startServer(translationsWatcher);
}

start().catch(err => {
  // `err` might be an array in case we provided the error list from webpack.
  if (Array.isArray(err)) {
    const formatted = err.map(message =>
      formatMessage(message, formatUtil.formatFirstLineMessage)
    );
    printErrors(formatted, writer);
  } else {
    log.error(err);
  }
  process.exit(1);
});
