const path              = require("path");
const {
        ContextReplacementPlugin,
        LoaderOptionsPlugin
      }                 = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const rootDir = path.resolve(__dirname, "..");

exports.root = function root(relativePath) {
  "use strict";
  return path.resolve(rootDir, relativePath);
};

/*
 * Include polyfills or mocks for various node stuff
 * Description: Node configuration
 *
 * See: https://webpack.github.io/docs/configuration.html#node
 */
exports.NODE_CONFIG = {
  global: true,
  crypto: "empty",
  process: true,
  module: false,
  clearImmediate: false,
  setImmediate: false
};

// These packages have problems with their source-maps.
// If any other packages have - just reference them here in the same style.
exports.EXCLUDE_SOURCE_MAPS = [
  // these packages have problems with their sourcemaps
  exports.root("node_modules/@angular"),
  exports.root("node_modules/rxjs")
];

// We should not use plain js files in our case, however,
// some of the libs may contain them. We're interested in their source-maps.
exports.RULE_LIB_SOURCE_MAP_LOADING = {
  test: /\.js$/,
  loader: "source-map-loader",
  exclude: [exports.EXCLUDE_SOURCE_MAPS]
};

/** Loader chain for typescript files in case of non-aot mode. Keep in mind that the list of loaders
 * uses topological order, i.e. they are defined in the reverse order they are used later on.
 * (1) The router loader translates the content of "loadChildren" to the code-splitting
 * variation of webpack.
 * (2) The template loader rewrites all "templateUrl" and "styleUrl" configs to their non-URL
 * counterparts and wraps the (relative) URL with a require statement.
 * (3) The atl takes care of properly transpiling our code using the TypeScript compiler.
 * (4) The HMR-loader does some transformations on our code to ensure that HMR will be working properly.
 * Note that this loader automatically disables itself in production mode and leaves the code untouched in that case.
 * Thus, there is no need to make a difference between development and production mode here.
 */
exports.RULE_TS_LOADING = {
  test: /\.ts$/,
  loaders: [
    "@angularclass/hmr-loader?pretty=true",
    "awesome-typescript-loader",
    "angular2-template-loader",
    "angular-router-loader"
  ]
};

/** Loader for dealing with out typescript files in AoT mode.
 Note that you MUST NOT configure another loader here, since this might break the whole step.
 This loader already takes care of delegating work to others if required.
 */
exports.RULE_TS_AOT_LOADING = {
  test: /\.ts$/,
  loader: "@ngtools/webpack",
};

/** HTML is loaded as a string in raw mode without any modification.
 * The only exception that the index template, which is dealt with by the
 * HtmlWebpackPlugin during build time.
 */
exports.RULE_HTML_LOADING = {
  test: /\.html/,
  loader: "raw-loader",
  exclude: [exports.root("src/index.template.html")]
};

/** Stylesheets in .scss format may be loaded in two different ways:
 * (1) As CSS by inserting it into a <style> or a <link> tag. That's what happens to the "main.scss" file,
 * since it does not refer to a particular component only.
 * The <style> tag is used in development, to get proper HMR.
 * The <link> tag is used as optimization for the production modes.
 * (2) As an inline string - that what happens to all .component.scss files, since they refer
 * to a particular component, and inlining simplifies dealing with them.
 */
const scssLoaderChain               = ["css-loader?importLoaders=1", "postcss-loader", "sass-loader"];
exports.RULE_MAIN_SASS_LOADING      = function RULE_MAIN_SASS_LOADING(isDev) {
  const result = {
    test: /main\.scss$/
  };
  if (isDev) {
    result.use = ["style-loader"].concat(scssLoaderChain);
  } else {
    result.use = ExtractTextPlugin.extract({
      fallback: "style-loader",
      use: scssLoaderChain
    });
  }
  return result;
};
exports.RULE_COMPONENT_SASS_LOADING = {
  test: /\.component\.scss$/,
  loaders: ["to-string-loader"].concat(scssLoaderChain)
};

/** A list of file extensions that may be tried resolved automatically by webpack
 * in case you did not provide them explicitly.
 * Add others here if that is required, but take care that this may slow down the
 * compilation process, since the attempts are executed in the order their corresponding
 * extensions are listed here.
 */
exports.DEFAULT_RESOLVE_EXTENSIONS = [".ts", ".js", ".json"];

exports.getDefaultContextReplacementPlugin = function getDefaultContextReplacementPlugin(src) {
  src = src || "src";
  return new ContextReplacementPlugin(
    /angular(\\|\/)core(\\|\/)@angular/, // See https://github.com/angular/angular/issues/11580#issuecomment-282705332
    exports.root(src)
  )
};

exports.getLoaderOptionsPlugin = function getLoaderOptionsPlugin(isDevMode) {
  const options = {
    options: {
      // Forwards options to the postcss-loader; put more of them here as required.
      // In its current state, only
      postcss: {
        plugins: [
          require("autoprefixer")({
            "browsers": ["last 2 versions"]
          })
        ]
      }
    }
  };

  if (!isDevMode) {
    // Forwards options to the sass-loader (and thus: node-sass); put more of them here as required.
    options.options.sassLoader = {
      outputStyle: "compressed"
    };
  }

  return new LoaderOptionsPlugin(options)
};

exports.getHtmlTemplatePlugin = function getHtmlTemplatePlugin(isDevMode) {
  return new HtmlWebpackPlugin({
    template: "src/index.template.html",
    filename: "index.html", // Keep in mind that the output path gets prepended to this name automatically.
    inject: "body",
    // Custom config.
    title: "Demo App",
    devMode: isDevMode,
    baseHref: "/",
    polyfillFile: "polyfills.dll.js",
    vendorFile: "vendor.dll.js"
  });
};

exports.getPerformanceOptions = function getPerformanceOptions(isProdMode) {
  return {
    /**
     * Show performance hints / warnings / errors. Especially displays warnings about too large entry points and chunks.
     * This is not useful in development mode (since no optimization is performed at this stage), but for any production
     * mode.
     */
    hints: isProdMode ? "warning" : false
  }
};
