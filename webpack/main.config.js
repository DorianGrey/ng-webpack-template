const commonConfig = require("./_common.config");
const devConfig    = require("./_dev.config");
const prodConfig   = require("./_production.config");
const aotConfig    = require("./_aot.config");
const merge        = require("webpack-merge");

const logger = require("log4js").getLogger("webpack-build");

module.exports = function (env = {}) {
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  // Eval configurable parts.
  env.isDev            = process.env.NODE_ENV !== "production";
  env.isWatch          = /dev-server|watch/.test(process.env.npm_lifecycle_event);

  logger.debug("Using build env:", JSON.stringify(env, null, 4));
  logger.debug("Build mode:", env.isDev ? "development" : "production");
  if (!env.isDev) {
    logger.debug("Using minifier:", env.useClosureCompiler ? "Closure Compiler" : "UglifyJs");
  }
  logger.debug("Using AoT:", env.useAot === true);

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
    commonConfig(env),
    env.isDev ? devConfig() : prodConfig(env),
    env.useAot ? aotConfig() : {}
  );
};