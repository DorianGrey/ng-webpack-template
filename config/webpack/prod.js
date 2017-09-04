const { NoEmitOnErrorsPlugin } = require("webpack");
const UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const HashedModuleIdsPlugin = require("webpack/lib/HashedModuleIdsPlugin");
const ModuleConcatenationPlugin = require("webpack/lib/optimize/ModuleConcatenationPlugin");
const { AotPlugin } = require("@ngtools/webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const InlineChunkManifestHtmlWebpackPlugin = require("inline-chunk-manifest-html-webpack-plugin");
const WebpackChunkHash = require("webpack-chunk-hash");
const PurifyPlugin = require("@angular-devkit/build-optimizer").PurifyPlugin;
const path = require("path");
const merge = require("webpack-merge");
const WorkboxPlugin = require("workbox-webpack-plugin");

const commonConfig = require("./common");
const paths = require("../paths");
const { ensureEndingSlash } = require("./util");

/**
 * The production build may or may not include the BundleAnalyzerPlugin to visualize the build
 * result and check if any of the illustrated sizes might be optimized, or if anything is missing
 * you might have expected. By default, it starts a server at port 5000. Adjust its options if required.
 *
 * At the time of writing, the plugin is used in every production build (with and without AoT),
 * except when the exemplary production server is started as well.
 * @param env Bundle config options.
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
    new ExtractTextPlugin(
      `static/css/[name].[contenthash:${env.hashDigits}].css`
    ),

    new ModuleConcatenationPlugin(),

    // Generate a service worker with pre-cached resources information.
    new WorkboxPlugin({
      globDirectory: env.outputDir,
      globPatterns: ["**/*.{html,js,css,jpg,eot,svg,woff2,woff,ttf,json}"],
      globIgnores: ["**/*.map", "service-worker.js"],
      swDest: path.join(env.outputDir, "service-worker.js"),
      swSrc: path.join(paths.appPublic, "service-worker.js")
    }),

    // Generate some information about the generated bundle size
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: path.join(env.statsDir, "bundle-size-report.html"),
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: path.join(env.statsDir, "bundle-size-report.json"),
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
    bail: true,
    output: {
      path: env.outputDir,
      filename: `static/js/[name].[chunkhash:${env.hashDigits}].js`,
      chunkFilename: `static/js/[id].chunk.[chunkhash:${env.hashDigits}].js`,
      publicPath: ensureEndingSlash(env.publicPath, true),
      devtoolModuleFilenameTemplate: info =>
        path.relative(paths.appSrc, info.absoluteResourcePath)
    },
    devtool: env.devtool,
    plugins: plugins
  };

  if (env.useAot) {
    result.plugins.push(
      new AotPlugin({
        tsConfigPath: paths.resolveApp("tsconfig.aot.json")
      })
    );
  }

  if (env.useBuildOptimizer) {
    result.module = {
      rules: [
        // Ngo optimization, see https://github.com/angular/angular-cli/pull/6520
        {
          test: /\.js$/,
          use: [
            {
              loader: "@angular-devkit/build-optimizer/webpack-loader",
              options: { sourceMap: env.devtool !== false }
            }
          ]
        }
      ]
    };
    result.plugins.push(new PurifyPlugin());
  }

  /**
   * Plugin to properly minify the build output.
   *
   * See: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
   */
  const uglifyOptions = {
    compress: {
      warnings: false,
      // This feature has been reported as buggy a few times, such as:
      // https://github.com/mishoo/UglifyJS2/issues/1964
      // We'll wait with enabling it by default until it is more solid.
      reduce_vars: false
    },
    output: {
      comments: false
    },
    sourceMap: env.devtool !== false
  };
  if (env.useBuildOptimizer) {
    uglifyOptions.compress.pure_getters = true;
    uglifyOptions.compress.passes = 3;
  }
  plugins.push(new UglifyJsPlugin(uglifyOptions));

  return merge.smart(commonConfig(env), result);
};
