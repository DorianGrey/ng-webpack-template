const commonConfig = require("./_common.config");
const devConfig    = require("./_dev.config");
const prodConfig   = require("./_production.config");
const aotConfig    = require("./_aot.config");
const merge        = require("webpack-merge");

const logger = require("log4js").getLogger("webpack-build");

module.exports = function (env) {
  env                            = env || {};
  process.env.NODE_ENV           = process.env.NODE_ENV || "development";
  // Eval configurable parts.
  const USE_AOT                  = env.aot === true;
  const IS_DEV                   = process.env.NODE_ENV !== "production";
  const NO_ANALYZE_PLUGIN_CONFIG = process.env.NO_ANALYZE_PLUGIN === "true";

  logger.debug("Build mode:", IS_DEV ? "development" : "production");
  logger.debug("Using AoT:", USE_AOT);

  return merge.smart(
    commonConfig(IS_DEV),
    IS_DEV ? devConfig() : prodConfig(!NO_ANALYZE_PLUGIN_CONFIG),
    USE_AOT ? aotConfig() : {}
  );
};