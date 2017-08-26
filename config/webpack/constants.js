const paths = require("../paths");
const { ContextReplacementPlugin } = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

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
  paths.resolveApp("node_modules/@angular"),
  paths.resolveApp("node_modules/rxjs")
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
 * However - due to the docs - it should be removed manually for production builds, thus we make a difference here.
 */
exports.RULE_TS_LOADING = function(isDev) {
  const use = [
    {
      loader: require.resolve("ts-loader"),
      options: {
        silent: true,
        transpileOnly: true // Everything else is processed by the corresponding plugin.
      }
    },
    "angular2-template-loader",
    "angular-router-loader"
  ];

  if (isDev) {
    use.unshift("@angularclass/hmr-loader?pretty=true");
  }

  return {
    test: /\.ts$/,
    use
  };
};

/** Loader for dealing with out typescript files in AoT mode.
 Note that you MUST NOT configure another loader here, since this might break the whole step.
 This loader already takes care of delegating work to others if required.
 */
exports.RULE_TS_AOT_LOADING = {
  test: /\.ts$/,
  loader: require.resolve("@ngtools/webpack")
};

/**
 * HTML rule to load is loaded as-is, but evaluated to determine external references, e.g. to images.
 */
exports.RULE_HTML_LOADING = {
  test: /\.html/,
  use: require.resolve("html-loader"),
  include: [/\.component\.html$/]
};

/**
 * HTML rule to load as a string without any evaluation or modification.
 */
exports.RULE_HTML_RAW_LOADING = {
  test: /\.html/,
  use: require.resolve("raw-loader"),
  exclude: [/\.component\.html$/]
};

/**
 * Directly referenced images are pushed through an appropriate minifier first,
 * and than path-adopted by the file-loader to get a fixed reference incl. hash.
 *
 * Note that this only aims at files in `src/assets`, since that folder is intended
 * for directly referenced resources.
 */
exports.RULE_IMG_LOADING = function(isDev, env) {
  return {
    test: /\.(gif|png|jpe?g)$/i,
    use: [
      {
        loader: require.resolve("file-loader"),
        query: {
          name: isDev
            ? "static/media/[name].[ext]"
            : `static/media/[name].[hash:${env.hashDigits}].[ext]`
        }
      },
      {
        loader: require.resolve("image-webpack-loader"),
        query: {
          bypassOnDebug: isDev
        }
      }
    ],
    include: [paths.resolveApp("src", "assets")]
  };
};

/** Stylesheets in .scss format may be loaded in two different ways:
 * (1) As CSS by inserting it into a <style> or a <link> tag. That's what happens to the "main.scss" file,
 * since it does not refer to a particular component only.
 * The <style> tag is used in development, to get proper HMR.
 * The <link> tag is used as optimization for the production modes.
 * (2) As an inline string - that what happens to all .component.scss files, since they refer
 * to a particular component, and inlining simplifies dealing with them.
 */
const scssLoaderChain = function(isDev) {
  return [
    {
      loader: require.resolve("css-loader"),
      options: {
        importLoaders: 1,
        minimize: !isDev,
        sourceMap: isDev
      }
    },
    {
      loader: require.resolve("postcss-loader"),
      options: {
        plugins: loader => [
          require("autoprefixer")({
            browsers: ["last 2 versions"]
          }),
          require("postcss-flexbugs-fixes")
        ],
        sourceMap: isDev
      }
    },
    {
      loader: require.resolve("sass-loader"),
      options: {
        sourceMap: isDev,
        outputStyle: isDev ? "nested" : "compressed"
      }
    }
  ];
};
exports.RULE_MAIN_SASS_LOADING = function RULE_MAIN_SASS_LOADING(isDev) {
  const result = {
    test: /main\.scss$/
  };

  const scssChain = scssLoaderChain(isDev);

  if (isDev) {
    result.use = [require.resolve("style-loader")].concat(scssChain);
  } else {
    result.use = ExtractTextPlugin.extract({
      fallback: require.resolve("style-loader"),
      use: scssChain
    });
  }
  return result;
};
exports.RULE_COMPONENT_SASS_LOADING = function(isDev) {
  return {
    test: /\.component\.scss$/,
    use: [require.resolve("to-string-loader")].concat(scssLoaderChain(isDev))
  };
};

/** A list of file extensions that may be tried resolved automatically by webpack
 * in case you did not provide them explicitly.
 * Add others here if that is required, but take care that this may slow down the
 * compilation process, since the attempts are executed in the order their corresponding
 * extensions are listed here.
 */
exports.DEFAULT_RESOLVE_EXTENSIONS = [".ts", ".js", ".json"];

exports.getDefaultContextReplacementPlugin = function getDefaultContextReplacementPlugin(
  src
) {
  src = src || "src";
  return new ContextReplacementPlugin(
    /angular(\\|\/)core(\\|\/)@angular/, // See https://github.com/angular/angular/issues/11580#issuecomment-282705332
    paths.resolveApp(src)
  );
};

exports.getHtmlTemplatePlugin = function getHtmlTemplatePlugin(
  isDevMode,
  buildConfig
) {
  const minify = isDevMode
    ? false
    : {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      };

  return new HtmlWebpackPlugin({
    template: paths.appHtml,
    filename: "index.html", // Keep in mind that the output path gets prepended to this name automatically.
    inject: "body",
    minify,
    // Custom config.
    title: "Demo App",
    devMode: isDevMode,
    baseHref: buildConfig.baseHref,
    publicUrl: buildConfig.publicUrl,
    polyfillFile: "polyfills.dll.js",
    vendorFile: "vendor.dll.js"
  });
};

exports.getTsCheckerPlugin = function getTsCheckerPlugin(env) {
  // Plugin to improve build and type checking speed; Will be included by default in the next major version.
  return new ForkTsCheckerWebpackPlugin({
    watch: "./src",
    tsconfig: "./tsconfig.json",
    async: !env.isWatch,
    formatter: "codeframe",
    tslint: "./tslint.json",
    memoryLimit: process.env.APPVEYOR ? 1024 : 2048 // 2048 is too much for appveyor...
  });
};

exports.getPerformanceOptions = function getPerformanceOptions() {
  return {
    // Size warnings are created in a custom configurable way, thus they are disabled here.
    hints: false
  };
};
