const path               = require("path");
const webpack            = require("webpack");
const DefinePlugin       = require("webpack/lib/DefinePlugin");
const NamedModulesPlugin = require("webpack/lib/NamedModulesPlugin");
const commons            = require("./constants");

module.exports = {

  entry: {},

  /**
   * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
   *
   * Do not change, leave as is or it wont work.
   * See: https://github.com/webpack/karma-webpack#source-maps
   */
  devtool: "inline-source-map",

  /**
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /**
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: commons.DEFAULT_RESOLVE_EXTENSIONS
  },

  /**
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    /**
     * An array of applied pre and post loaders.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
     */
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
        loader: "source-map-loader",
        exclude: [commons.EXCLUDE_SOURCE_MAPS]
      },
      /**
       * Typescript loader support for .ts and Angular 2 async routes via .async.ts
       *
       * See: https://github.com/s-panferov/awesome-typescript-loader
       */
      {
        test: /\.ts$/,
        loaders: [
          "awesome-typescript-loader?sourceMap=false,inlineSourceMap=true",
          "angular2-template-loader"
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
        // BEWARE: This loader is currently fixed at version 0.2.0 => 1.0.0 does NOT work atm!
        test: /\.(js|ts)$/, loader: "istanbul-instrumenter-loader",
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
    commons.addDefaultContextReplacementPlugin(),
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV || "test")
    }),
    new NamedModulesPlugin()
  ],
  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: commons.NODE_CONFIG
};