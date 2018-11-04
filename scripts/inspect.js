const logger = require("signale");

const inspectConfigs = process.argv.slice(2);

if (inspectConfigs.length === 0) {
  logger.error("Please provide at least one configuration to be inspected.");
  return;
}

const cfgName = inspectConfigs[0];
switch (cfgName) {
  case "dev":
  case "development":
    process.env.NODE_ENV = "development";
    const devOptions = require("../config/dev.config").parseFromCLI();
    const devConfig = require("../config/webpack/config")(devOptions);
    logger.info("\n" + devConfig.toString());
    break;
  case "prod":
  case "production":
    process.env.NODE_ENV = "production";
    const buildOptions = require("../config/build.config").parseFromCLI();
    const buildConfig = require("../config/webpack/config")(buildOptions);
    logger.info("\n" + buildConfig.toString());
    break;
  case "dll":
    process.env.NODE_ENV = "development";
    const dllConfig = require("../config/webpack/dll")();
    logger.info("\n" + dllConfig.toString());
    break;

  default:
    logger.error(`Unknown or not yet supported config: ${cfgName}.`);
    break;
}
