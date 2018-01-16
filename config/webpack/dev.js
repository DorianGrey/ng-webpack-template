const { DllReferencePlugin, NamedModulesPlugin } = require("webpack");
const HotModuleReplacementPlugin = require("webpack/lib/HotModuleReplacementPlugin");
const path = require("path");
const merge = require("webpack-merge");

const ErrorFormatterPlugin = require("./plugins/ErrorFormatterPlugin");
const paths = require("../paths");
const commonConfig = require("./common");
const { ensureEndingSlash } = require("./util");

module.exports = function(env) {
  const plugins = [
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
    new NamedModulesPlugin(),
    new ErrorFormatterPlugin()
  ];

  if (env.isHot) {
    plugins.push(new HotModuleReplacementPlugin());
  }

  return merge.smart(commonConfig(env), {
    output: {
      path: env.outputDir,
      filename: "static/js/[name].js",
      chunkFilename: "static/js/[name].js",
      publicPath: ensureEndingSlash(env.publicPath, true),
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
    plugins
  });
};
