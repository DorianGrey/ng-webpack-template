const {
        DefinePlugin,
        ProgressPlugin
      }                   = require("webpack");
const {ForkCheckerPlugin} = require("awesome-typescript-loader");
const {
        root,
        DEFAULT_RESOLVE_EXTENSIONS,
        NODE_CONFIG,
        getHtmlTemplatePlugin,
        getLoaderOptionsPlugin,
        getDefaultContextReplacementPlugin,
        RULE_LIB_SOURCE_MAP_LOADING,
        RULE_TS_LOADING,
        RULE_HTML_LOADING,
        RULE_MAIN_SASS_LOADING,
        RULE_COMPONENT_SASS_LOADING
      }                   = require("./constants");

module.exports = function (isDev) {
  return {
    entry: root("src/main.ts"),
    resolve: {
      extensions: DEFAULT_RESOLVE_EXTENSIONS
    },
    module: {
      rules: [
        RULE_LIB_SOURCE_MAP_LOADING,
        RULE_TS_LOADING, // This will get overridden by AoT plugin if available.
        RULE_HTML_LOADING,
        RULE_MAIN_SASS_LOADING(isDev),
        RULE_COMPONENT_SASS_LOADING
      ]
    },
    node: NODE_CONFIG,
    plugins: [
      getHtmlTemplatePlugin(isDev),
      getLoaderOptionsPlugin(isDev),
      new DefinePlugin({
        ENV: JSON.stringify(process.env.NODE_ENV || "development")
      }),
      new ProgressPlugin(),
      getDefaultContextReplacementPlugin(),
      new ForkCheckerPlugin()
    ]
  };
};