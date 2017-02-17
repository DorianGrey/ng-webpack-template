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

  /** See the docs for more information about how merging configs is implemented:
   * https://github.com/survivejs/webpack-merge/blob/master/README.md
   *
   * The most important things in our case (using the default merging strategies) are:
   * - Hashes: Deep-merge
   * - Arrays: Concatenation
   *   => Exception: The array from "module.rules" - we're using different loaders for TS
   *      files in normal and in AoT mode. The merge strategy replaces rules from that list
   *      if two conditions are met:
   *      (1) The `test` is equal.
   *      (2) The `loader` and/or `loaders` field cannot be merge, which is the case if at
   *          least one of them is an array (this holds true for RULE_TS_LOADING)
   *      This strategy enables the overwrite of the TS-rule in case of AoT mode.
   */
  return merge.smart(
    commonConfig(IS_DEV, USE_AOT),
    IS_DEV ? devConfig() : prodConfig(!NO_ANALYZE_PLUGIN_CONFIG),
    USE_AOT ? aotConfig() : {}
  );
};