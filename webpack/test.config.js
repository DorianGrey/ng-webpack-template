const path               = require("path");
const {
        DefinePlugin,
        NamedModulesPlugin
      }                  = require("webpack");
const commons            = require("./constants");

module.exports = {
  /**
   * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
   *
   * Do not change, leave as is or it wont work.
   * See: https://github.com/webpack/karma-webpack#source-maps
   */
  devtool: "inline-source-map",
  resolve: {
    extensions: commons.DEFAULT_RESOLVE_EXTENSIONS
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
        use: "source-map-loader",
        exclude: [commons.EXCLUDE_SOURCE_MAPS]
      },
      /**
       * Typescript loader support for .ts and Angular 2 async routes.
       * Note that the processing steps differ from the ones defined in RULE_TS_LOADING.
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader
       */
      {
        test: /\.ts$/,
        use: [
          "awesome-typescript-loader?sourceMap=false,inlineSourceMap=true",
          "angular2-template-loader"
        ],
        exclude: [/\.e2e\.ts$/]
      },

      /**
       * Instruments JS files with Istanbul for subsequent code coverage reporting.
       * Instrument only testing sources.
       * FIXME: This loader is currently fixed at version 0.2.0 => >=1.0.0 does NOT work atm.;
       * It fires curious errors regarding source maps that may not be found, although they are
       * used in the created report ...
       *
       * See: https://github.com/deepsweet/istanbul-instrumenter-loader
       */
      {
        test: /\.(js|ts)$/,
        use: "istanbul-instrumenter-loader",
        enforce: "post",
        include: path.resolve(process.cwd(), "src"),
        exclude: [
          /test-setup\.js/,
          /\.(e2e|spec)\.ts$/
        ]
      }
    ]
  },
  plugins: [
    commons.getDefaultContextReplacementPlugin(),
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV || "test")
    }),
    new NamedModulesPlugin()
  ],
  performance: commons.getPerformanceOptions(false),
  node: commons.NODE_CONFIG
};