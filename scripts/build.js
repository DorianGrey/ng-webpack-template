process.env.NODE_ENV = "production";

const webpack = require("webpack");
const fs      = require("fs-extra");
const merge   = require("webpack-merge");

const compileTranslations = require("../dev/translations").compile;
const commonConfig = require("../config/webpack/_common.config");
const prodConfig   = require("../config/webpack/_production.config");
const buildConfig  = require("../config/build.config")();

const logger = require("log4js").getLogger("webpack-build");
logger.level = "DEBUG";

process.on("unhandledRejection", err => {
  logger.error(err);
  throw err;
});

Promise.resolve()
  .then(() => {
    logger.info("Compiling translations...");
    return compileTranslations("src/**/*.i18n.yml", "src/generated/translations.ts");
  })
  .then(() => new Promise((resolve, reject) => {
    let config;

    try {
      config = merge.smart(
        commonConfig(buildConfig),
        prodConfig(buildConfig)
      );
    } catch (e) {
      return reject(e);
    }

    logger.info("Clearing output targets:", buildConfig.outputDir, buildConfig.statsDir);
    Promise.all([
      fs.emptyDir(buildConfig.outputDir),
      fs.emptyDir(buildConfig.statsDir)
    ])
      .then(() => resolve(config));
  }))
  .then(config => new Promise((resolve, reject) => {
    logger.info("Starting build...");

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
      logger.info(stats.toString());
      resolve(stats);
    })
  }))
  .catch(e => {
    logger.error(e);
    process.exit(1);
  })
;
