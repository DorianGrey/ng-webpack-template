const {root}          = require("./constants");
const devServerConfig = require("./dev-server.config.js");

module.exports = function () {
  return {
    output: {
      path: root(".tmp"),
      filename: "bundle.js"
    },
    devtool: "inline-source-map",
    plugins: [
      new DllReferencePlugin({
        context: ".",
        manifest: require(root(".tmp/polyfills-manifest.json"))
      }),
      new DllReferencePlugin({
        context: ".",
        manifest: require(root(".tmp/vendor-manifest.json"))
      }),
    ],
    devServer: devServerConfig
  };
};