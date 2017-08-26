const { DllReferencePlugin, NamedModulesPlugin } = require("webpack");
const path = require("path");
const paths = require("../paths");
const devServerConfig = require("./dev-server.config.js");

module.exports = function() {
  return {
    output: {
      path: paths.resolveApp(".tmp"),
      filename: "static/js/[name].js",
      chunkFilename: "static/js/[id].chunk.js",
      pathinfo: true,
      devtoolModuleFilenameTemplate: info =>
        path.relative(paths.appSrc, info.absoluteResourcePath)
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
        manifest: require(paths.resolveApp(".tmp/polyfills-manifest.json"))
      }),
      new DllReferencePlugin({
        context: ".",
        manifest: require(paths.resolveApp(".tmp/vendor-manifest.json"))
      }),
      new NamedModulesPlugin()
    ],
    devServer: devServerConfig
  };
};
