const {
        DefinePlugin,
        ProgressPlugin
      }                          = require("webpack");
const {CheckerPlugin}            = require("awesome-typescript-loader");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const {
        root,
        DEFAULT_RESOLVE_EXTENSIONS,
        NODE_CONFIG,
        getHtmlTemplatePlugin,
        getLoaderOptionsPlugin,
        getPerformanceOptions,
        getDefaultContextReplacementPlugin,
        RULE_LIB_SOURCE_MAP_LOADING,
        RULE_TS_LOADING,
        RULE_HTML_LOADING,
        RULE_MAIN_SASS_LOADING,
        RULE_COMPONENT_SASS_LOADING
      }                          = require("./constants");

/**
 * It might seem a little bit suspicious to use a mode-specific parameterized function in a "common"
 * config part. However, there are some plugins (HTML, LoaderOptions, ...) that cannot be easily merged,
 * even if provided by different modes, since only the parameters passed to them differ and not the plugins
 * themselves. Thus, we're using the `isDev` parameter to determine the exact target mode and simplify the
 * option details this way.
 * @param env Bundle environment options.
 */
module.exports = function (env) {
  const isDev  = env.isDev,
        useAot = env.useAot;

  const plugins = [
    // HTML plugin to generate proper index.html files w.r.t. the output of this build.
    getHtmlTemplatePlugin(isDev),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: "defer"
    }),
    // Plugin to provide options to our loaders.
    getLoaderOptionsPlugin(isDev),
    /**
     * Plugin to define several variables. "process.env.NODE_ENV" is forwarded so that libraries may
     * react on it (e.g. by skipping some of their code). Please keep in mind that this is only possible
     * since our node config enables shimming the "process" variable.
     *
     * Note: Webpack is capable of conditionally dropping code w.r.t. these variables.
     * E.g. if a variable `ENV` is defined as `"whatever"`, and you have some code like:
     *
     *     if (ENV !== "whatever") {...}
     *
     * Then the code inside the braces will be dropped during the bundle process.
     * We're using this for conditionally executing development / production code.
     */
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV || "development"),
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development")
      }
    }),
    // Plugin for displaying bundle process stage.
    new ProgressPlugin(),
    // Plugin of atl. to improve build and type checking speed; Will be included by default in the next major version.
    new CheckerPlugin()
  ];

  if (!useAot) {
    // Fix the angular2 context w.r.t. to webpack and the usage of System.import in their "load a component lazily" code.
    // Note: Since a version > 1.2.4 of the @ngtools/webpack plugin, the context replacement conflicts with it (seems to deal with it itself).
    // Thus, we only add this plugin in case we're NOT aiming at AoT compilation.
    plugins.push(getDefaultContextReplacementPlugin());
  }

  return {
    entry: {
      bundle: root("src/main.ts")
    },
    /**
     * Options affecting the resolving of modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve
     */
    resolve: {
      /**
       * An array of extensions that should be used to resolve modules.
       * Note that this only affects files that are referenced <without> a particular extension.
       *
       * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
       */
      extensions: DEFAULT_RESOLVE_EXTENSIONS
    },
    /**
     * Options affecting the normal modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#module
     */
    module: {
      /**
       * An array of rules to be applied..
       * Note that the syntax has changed in 2.1.0-beta.24 : https://github.com/webpack/webpack/releases/tag/v2.1.0-beta.24
       * Since this release, you no longer have to define preloaders and postloaders separately; just add
       * `enforce: "pre"` or `enforce: "post"` to a particular rule.
       *
       * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
       */
      rules: [
        RULE_LIB_SOURCE_MAP_LOADING,
        RULE_TS_LOADING, // This will get overridden by RULE_TS_AOT_LOADING if AoT mode is activated.
        RULE_HTML_LOADING,
        RULE_MAIN_SASS_LOADING(isDev),
        RULE_COMPONENT_SASS_LOADING
      ]
    },
    /**
     * Include polyfills or mocks for various node stuff
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: NODE_CONFIG,
    /**
     * Any plugins to be used in this build.
     *
     * See: http://webpack.github.io/docs/configuration.html#plugins
     */
    plugins: plugins,
    performance: getPerformanceOptions(!isDev)
  };
};