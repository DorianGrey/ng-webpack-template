const { NoEmitOnErrorsPlugin } = require("webpack");
const UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const HashedModuleIdsPlugin = require("webpack/lib/HashedModuleIdsPlugin");
const ModuleConcatenationPlugin = require("webpack/lib/optimize/ModuleConcatenationPlugin");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const InlineChunkManifestHtmlWebpackPlugin = require("inline-chunk-manifest-html-webpack-plugin");
const WebpackChunkHash = require("webpack-chunk-hash");
const PurifyPlugin = require("@angular-devkit/build-optimizer").PurifyPlugin;
const { root } = require("./constants");

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
module.exports = function(env) {
  /*
   Plugins utilizing long term caching.
   Used plugins and setup primarily based on https://webpack.js.org/guides/caching/

   If you don't want or need long term caching strategies, add `--env.disableLongTermCaching` to the build parameters.
   */
  const longTermCachingPlugins = env.disableLongTermCaching
    ? []
    : [
        // For more consistent module IDs
        new HashedModuleIdsPlugin(),
        // Creates a dynamic vendor chunk by including all entries from the `node_modules` directory.
        new CommonsChunkPlugin({
          name: "vendor",
          minChunks: ({ resource }) => /node_modules/.test(resource)
        }),
        // Externalizes the application manifest.
        new CommonsChunkPlugin("manifest"),
        // Extracts the chunk manifest and inlines it into the template
        new InlineChunkManifestHtmlWebpackPlugin({
          filename: "chunk-manifest.json",
          dropAsset: true
        }),
        // More consistent chunk hashes
        new WebpackChunkHash()
      ];

  const plugins = longTermCachingPlugins.concat([
    // Plugin to let the whole build fail on any error; i.e. do not tolerate these
    new NoEmitOnErrorsPlugin(),

    /**
     * Plugin to extract styles as css files; We're using this for the main.scss only atm.
     * This may optimize loading time in production mode since it may be cached by the browser separately.
     *
     * See: http://webpack.github.io/docs/stylesheets.html#separate-css-bundle
     */
    new ExtractTextPlugin("main.[contenthash].css"),

    new ModuleConcatenationPlugin(),

    // Generate some information about the generated bundle size
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: root("buildStats", "bundle-size-report.html"),
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: root("buildStats", "bundle-size-report.json"),
      logLevel: "silent"
    })
  ]);

  /**
   * In general, [hash] identifies the whole build, whereas [chunkhash] identifies the particular chunk.
   * Using these is one way to simplify cache busting.
   *
   * See: http://webpack.github.io/docs/configuration.html#output-filename
   */
  const result = {
    output: {
      path: root("dist"),
      filename: "[name].[chunkhash].js",
      chunkFilename: "[id].chunk.[chunkhash].js"
    },
    devtool: false,
    plugins: plugins
  };

  if (env.useBo) {
    result.module = {
      rules: [
        // Ngo optimization, see https://github.com/angular/angular-cli/pull/6520
        {
          test: /\.js$/,
          use: [
            {
              loader: "@angular-devkit/build-optimizer/webpack-loader",
              options: { sourceMap: false }
            }
          ]
        }
      ]
    };
    result.plugins.push(new PurifyPlugin());
  }

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
        concurrency: 3
      })
    );
  } else {
    const uglifyOptions = {
      beautify: false,
      comments: false,
      warnings: false
    };
    if (env.useBo) {
      uglifyOptions.compress = {
        pure_getters: true,
        passes: 3,
        warnings: false
      };
    }
    plugins.push(new UglifyJsPlugin(uglifyOptions));
  }

  return result;
};
