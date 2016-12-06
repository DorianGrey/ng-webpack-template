const {AotPlugin} = require("@ngtools/webpack");
const {
        root,
        RULE_TS_AOT_LOADING
      }           = require("./constants");

module.exports = function () {
  return {
    output: {
      path: root("dist-aot")
    },
    module: {
      rules: [
        RULE_TS_AOT_LOADING // Overwrites RULE_TS_LOADING from _common.config.js .
      ]
    },
    plugins: [
      // Plugin to simplify the whole ngc => ts => webpack process to a single step.
      new AotPlugin({
        tsConfigPath: root("tsconfig.aot.json")
      })
    ]
  };
};