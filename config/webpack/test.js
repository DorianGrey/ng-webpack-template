const path = require("path");
const { DefinePlugin, NamedModulesPlugin } = require("webpack");
const WebpackKarmaDieHardPlugin = require("webpack-karma-die-hard");
const {
  DEFAULT_RESOLVE_EXTENSIONS,
  EXCLUDE_SOURCE_MAPS,
  NODE_CONFIG,
  PERFORMANCE_OPTIONS
} = require("./factories/constants");

const {
  PLUGIN_CONTEXT_REPLACEMENT_ANGULAR_CORE,
  PLUGIN_TS_CHECKER
} = require("./factories/plugins");

module.exports = {
  /**
   * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
   *
   * Do not change, leave as is or it wont work.
   * See: https://github.com/webpack/karma-webpack#source-maps
   */
  devtool: "inline-source-map",
  resolve: {
    extensions: DEFAULT_RESOLVE_EXTENSIONS
  },
  module: {
    rules: [
      /**
       * Source map loader support for *.js files
       * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
       *
       * See: https://github.com/webpack/source-map-loader
       */
      {
        test: /\.js$/,
        enforce: "pre",
        use: require.resolve("source-map-loader"),
        exclude: [EXCLUDE_SOURCE_MAPS]
      },
      /**
       * Typescript loader support for .ts and Angular 2 async routes.
       * Note that the processing steps differ from the ones defined in RULE_TS_LOADING.
       */
      {
        test: /\.ts$/,
        use: [
          {
            loader: require.resolve("ts-loader"),
            options: {
              silent: true,
              transpileOnly: true, // Everything else is processed by the corresponding plugin.
              compilerOptions: {
                sourceMap: false,
                inlineSourceMap: true
              }
            }
          },
          require.resolve("angular2-template-loader")
        ],
        exclude: [/\.e2e\.ts$/]
      },

      /**
       * Instruments JS files with Istanbul for subsequent code coverage reporting.
       * Instrument only testing sources.
       *
       * See: https://github.com/deepsweet/istanbul-instrumenter-loader
       */
      {
        test: /\.(js|ts)$/,
        use: require.resolve("istanbul-instrumenter-loader"),
        enforce: "post",
        include: path.resolve(process.cwd(), "src"),
        exclude: [/test-setup\.js/, /\.(e2e|spec)\.ts$/]
      }
    ]
  },
  plugins: [
    PLUGIN_CONTEXT_REPLACEMENT_ANGULAR_CORE(),
    PLUGIN_TS_CHECKER({}),
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV || "test")
    }),
    new NamedModulesPlugin(),
    new WebpackKarmaDieHardPlugin()
  ],
  performance: PERFORMANCE_OPTIONS,
  node: NODE_CONFIG
};
