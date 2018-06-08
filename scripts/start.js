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

async function startServer(translationsWatcher) {
  info("Starting development server...");

  const { selectPort } = require("../config/hostInfo");
  const selectedPort = await selectPort(devOptions.port);
  devOptions.port = selectedPort;
  info("Build config in use: " + JSON.stringify(devOptions, null, 4));

  const serve = require("webpack-serve");
  const devServerConfig = require("../config/webpack/dev-server");

  const config = devConfig(devOptions);
  const devServerConfigBuilt = devServerConfig(
    config.output.publicPath,
    selectedPort,
    devOptions.isHot
  );

  let devServer;
  try {
    devServer = serve({ config, ...devServerConfigBuilt });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const serverInstance = devServer.then(server => {
    ["SIGINT", "SIGTERM"].forEach(sig => {
      process.on(sig, () => {
        translationsWatcher.close();
        server.close();
        process.exit(0);
      });
    });

    server.on("listening", () => {
      info("Dev server listening...");
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
    console.error(err);
  }
  process.exit(1);
});
