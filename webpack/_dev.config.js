const {
        DllReferencePlugin,
        NamedModulesPlugin
      }                    = require("webpack");
const {root}               = require("./constants");
const devServerConfig      = require("./dev-server.config.js");

module.exports = function () {
  return {
    output: {
      path: root(".tmp"),
      filename: "bundle.js"
    },
    /**
     * This is a rather expensive source map w.r.t. rebuild performance, but also a really
     * detailed one, which simplifies debugging.
     * The rebuild performance loss is acceptable for dev mode. If you don't think so,
     * you just have to switch to a cheaper one.
     * See the docs: http://webpack.github.io/docs/build-performance.html#sourcemaps
     */
    devtool: "inline-source-map",
    plugins: [
      // These plugins are referencing the DLLs build from the definitions in dll.config.js .
      // Note that they are referencing the generated manifests and not the files themselves.
      new DllReferencePlugin({
        context: ".",
        manifest: require(root(".tmp/polyfills-manifest.json"))
      }),
      new DllReferencePlugin({
        context: ".",
        manifest: require(root(".tmp/vendor-manifest.json"))
      }),
      new NamedModulesPlugin()
    ],
    devServer: devServerConfig
  };
};