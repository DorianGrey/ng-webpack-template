const {NoEmitOnErrorsPlugin} = require("webpack");
const UglifyJsPlugin         = require("webpack/lib/optimize/UglifyJsPlugin");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ExtractTextPlugin    = require("extract-text-webpack-plugin");
const {root}               = require("./constants");

const ClosureCompilerPlugin = require("webpack-closure-compiler");

/**
 * The production build may or may not include the BundleAnalyzerPlugin to visualize the build
 * result and check if any of the illustrated sizes might be optimized, or if anything is missing
 * you might have expected. By default, it starts a server at port 5000. Adjust its options if required.
 *
 * At the time of writing, the plugin is used in every production build (with and without AoT),
 * except when the exemplary production server is started as well.
 * @param env Bundle environment options.
 */
module.exports = function (env) {
  const plugins = [
    // Plugin to let the whole build fail on any error; i.e. do not tolerate these
    new NoEmitOnErrorsPlugin(),

    /**
     * Plugin to extract styles as css files; We're using this for the main.scss only atm.
     * This may optimize loading time in production mode since it may be cached by the browser separately.
     *
     * See: http://webpack.github.io/docs/stylesheets.html#separate-css-bundle
     */
    new ExtractTextPlugin("main.[contenthash].css")
  ];

  /**
   * Plugin to properly minify the build output in one of two ways.
   *
   * See:
   * - http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
   * - https://github.com/roman01la/webpack-closure-compiler
   */
  if (env.useClosureCompiler) {
    plugins.push(
      new ClosureCompilerPlugin({
        compiler: {
          language_in: "ECMASCRIPT5",
          language_out: "ECMASCRIPT5"
          // Note: compilation_level: 'ADVANCED' does not work (yet?); it causes some weird errors regarding the usage of .prototype.
        },
        concurrency: 3,
      })
    );
  } else {
    plugins.push(
      new UglifyJsPlugin({
        beautify: false,
        comments: false
      })
    );
  }

  if (env.analyzeBundles) {
    plugins.push(new BundleAnalyzerPlugin({analyzerPort: 5000}));
  }

  /**
   * In general, [hash] identifies the whole build, whereas [chunkhash] identifies the particular chunk.
   * Using these is one way to simplify cache busting.
   *
   * See: http://webpack.github.io/docs/configuration.html#output-filename
   */
  return {
    output: {
      path: root("dist"),
      filename: "[name].[chunkhash].js",
      chunkFilename: "[id].chunk.[chunkhash].js"
    },
    devtool: false,
    plugins: plugins
  };
};