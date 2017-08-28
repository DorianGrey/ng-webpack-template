const { DllReferencePlugin, NamedModulesPlugin } = require("webpack");
const HotModuleReplacementPlugin = require("webpack/lib/HotModuleReplacementPlugin");
const path = require("path");
const merge = require("webpack-merge");

const ErrorFormatterPlugin = require("./plugins/ErrorFormatterPlugin");
const paths = require("../paths");
const commonConfig = require("./_common.config");

module.exports = function(env) {
  return merge.smart(commonConfig(env), {
    output: {
      path: env.outputDir,
      filename: "static/js/[name].js",
      chunkFilename: "static/js/[id].chunk.js",
      publicPath: env.publicUrl,
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
    devtool: env.devtool,
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
      new HotModuleReplacementPlugin(),
      new NamedModulesPlugin(),
      new ErrorFormatterPlugin()
    ]
  });
};
