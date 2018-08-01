const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const { AngularCompilerPlugin } = require("@ngtools/webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const WebpackChunkHash = require("webpack-chunk-hash");
const path = require("path");
const merge = require("webpack-merge");
const { InjectManifest } = require("workbox-webpack-plugin");
const rxPaths = require("rxjs/_esm5/path-mapping");

const commonConfig = require("./common");
const paths = require("../paths");
const getBasicUglifyOptions = require("./uglify.config");
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
  const plugins = [
    /**
     * Plugin to extract styles as css files; We're using this for the main.scss only atm.
     * This may optimize loading time in production mode since it may be cached by the browser separately.
     *
     * See: https://github.com/webpack-contrib/mini-css-extract-plugin
     */
    new MiniCssExtractPlugin({
      filename: `static/css/[name].[contenthash:${env.hashDigits}].css`,
      chunkFilename: `static/css/[name].[contenthash:${env.hashDigits}].css`
    }),

    // Generate some information about the generated bundle size
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: path.join(env.statsDir, "bundle-size-report.html"),
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: path.join(env.statsDir, "bundle-size-report.json"),
      logLevel: "silent"
    }),
    // More consistent chunk hashes
    new WebpackChunkHash()
  ];

  if (env.withServiceWorker) {
    plugins.push(
      // Generate a service worker with pre-cached resources information.
      new InjectManifest({
        // TODO: See if we can get "local" back to working - it currently fails
        // due to a blocked google-analytics module (which we do not even link ?!)
        importWorkboxFrom: "cdn",
        globDirectory: env.outputDir,
        globIgnores: ["**/*.map", "service-worker.js"],
        swDest: "service-worker.js",
        swSrc: path.join(paths.appPublic, "service-worker.js")
      })
    );
  }

  /**
   * In general, [hash] identifies the whole build, whereas [chunkhash] identifies the particular chunk.
   * Using these is one way to simplify cache busting.
   *
   * See: http://webpack.github.io/docs/configuration.html#output-filename
   */
  const result = {
    bail: true,
    mode: "production",
    output: {
      path: env.outputDir,
      filename: `static/js/[name].[chunkhash:${env.hashDigits}].js`,
      chunkFilename: `static/js/[name].[chunkhash:${env.hashDigits}].js`,
      publicPath: ensureEndingSlash(env.publicPath, true),
      devtoolModuleFilenameTemplate: info =>
        path.relative(paths.appSrc, info.absoluteResourcePath)
    },
    devtool: env.devtool,
    plugins: plugins,
    resolve: {
      alias: rxPaths()
    },

    performance: false,
    optimization: {
      concatenateModules: true,
      removeEmptyChunks: true,
      minimize: true
    }
  };

  /**
   * Plugin to properly minify the build output.
   *
   * See: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
   */
  const uglifyOptions = getBasicUglifyOptions();

  if (env.useBuildOptimizer) {
    uglifyOptions.compress.pure_getters = true;
    uglifyOptions.compress.passes = 3;
  }

  result.optimization.minimizer = result.optimization.minimizer || [];
  result.optimization.minimizer.push(
    new UglifyJsPlugin({
      uglifyOptions,
      sourceMap: env.devtool !== false
    })
  );

  if (env.withExperimentalCssOptimization) {
    result.optimization.minimizer.push(
      /**
       * Separate plugin for more advanced minification/simple optimization.
       * "Basic" optimizations are already performed via the style rules.
       *
       *  // TODO 1: The source map does not seem to be that accurate, and does not seem to properly re-map to the original file.
       *  // TODO 2: This seems to remove vendor-prefixed stuff, which it should not do.
       *
       * Note that the `cssProcessorOptions` is provided as the second
       * parameter to `cssnano.process`, and there is no way to provide `cssnanoOpts`
       * manually.
       *
       * See https://github.com/webpack-contrib/mini-css-extract-plugin#minimizing-for-production
       */
      new OptimizeCssAssetsPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorOptions: {
          // This breaks names in case they are used in different files, e.g. via `grid-area`
          reduceIdents: false,
          map: { inline: false }
        },
        canPrint: true
      })
    );
  }

  // Creates a vendor chunk.
  result.optimization.splitChunks = {
    chunks: "all",
    name: "vendor"
  };
  // Creates a runtime chunk, containing name mappings and webpack runtime.
  result.optimization.runtimeChunk = { name: "runtime" };

  if (env.useAot) {
    result.plugins.push(
      new AngularCompilerPlugin({
        tsConfigPath: paths.resolveApp("tsconfig.aot.json")
      })
    );
  }

  if (env.useBuildOptimizer) {
    result.module = {
      rules: [
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
  }

  return merge.smart(commonConfig(env), result);
};
