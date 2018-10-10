const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const paths = require("../../paths");

const constants = require("./constants");

// We should not use plain js files in our case, however,
// some of the libs may contain them. We're interested in their source-maps.
// In addition, the temporary files generated during AoT compilation while not using
// the build optimizer don't have a source map file along.
exports.RULE_LIB_SOURCE_MAP_LOADING = {
  test: /\.js$/,
  use: require.resolve("source-map-loader"),
  exclude: [constants.EXCLUDE_SOURCE_MAPS, /\.ng(factory|style).js$/]
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
    require.resolve("angular2-template-loader"),
    require.resolve("angular-router-loader")
  ];

  if (isDev) {
    use.unshift({
      loader: require.resolve("@angularclass/hmr-loader"),
      options: {
        pretty: true
      }
    });
  }

  return {
    test: /\.ts$/,
    use
  };
};

/**
 * Loader for dealing with out typescript files in AoT mode.
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
exports.RULE_IMG_LOADING = function(env) {
  return {
    test: /\.(gif|png|jpe?g)$/i,
    use: [
      {
        loader: require.resolve("file-loader"),
        query: {
          name: env.isDev
            ? "static/media/[name].[ext]"
            : `static/media/[name].[hash:${env.hashDigits}].[ext]`
        }
      },
      {
        loader: require.resolve("image-webpack-loader"),
        query: {
          bypassOnDebug: env.isDev
        }
      }
    ],
    include: [paths.resolveApp("src", "assets")]
  };
};

const defaultStyleLoaders = function(isDev) {
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
        sourceMap: isDev
      }
    }
  ];
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
    ...defaultStyleLoaders(isDev),
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
    result.use = [MiniCssExtractPlugin.loader].concat(scssChain);
  }
  return result;
};
exports.RULE_COMPONENT_SASS_LOADING = function(isDev) {
  return {
    test: /\.component\.scss$/,
    use: [require.resolve("to-string-loader")].concat(scssLoaderChain(isDev))
  };
};

exports.RULE_CSS_LOADING = function RULE_CSS(isDev) {
  const result = {
    test: /\.css$/
  };

  const styleChain = defaultStyleLoaders(isDev);

  if (isDev) {
    result.use = [require.resolve("style-loader")].concat(styleChain);
  } else {
    result.use = [MiniCssExtractPlugin.loader].concat(styleChain);
  }

  return result;
};

// TODO: We'll have to remove this rule ASAP - but atm., not using this rule
// causes a deprecation warning.
exports.RULE_IGNORE_SYSTEM_IMPORT = {
  // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
  // Removing this will cause deprecation warnings to appear.
  test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
  parser: { system: true }
};
