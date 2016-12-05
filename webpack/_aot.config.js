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
        RULE_TS_AOT_LOADING
      ]
    },
    plugins: [
      new AotPlugin({
        tsConfigPath: root("tsconfig.aot.json")
      })
    ]
  };
};