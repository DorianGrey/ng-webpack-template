const {
  ContextReplacementPlugin,
  EnvironmentPlugin,
  NamedChunksPlugin
} = require("webpack");
const Config = require("webpack-chain");
const path = require("path");
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const ErrorFormatterPlugin = require("./plugins/ErrorFormatterPlugin");
const chunkNameHandler = require("./helpers/chunkNameHandler");
const paths = require("../paths");
const { log, asyncLog, buildLog } = require("../logger");
const getBasicTerserOptions = require("./terser.config");
const { ensureEndingSlash } = require("./util");
const { NODE_CONFIG, DEFAULT_RESOLVE_EXTENSIONS } = require("./constants");

/**
 * Creates a version information based on the environment configuration.
 * It is displayed in the footer.
 *
 * @param env The current configuration, either from `config/dev.config.js` or `build.config.js`.
 */
function createVersionString(env) {
  const src = [process.env.NODE_ENV];
  src[0] = src[0].charAt(0).toUpperCase() + src[0].slice(1);
  if (env.useAot) {
    src.push("AoT mode");
  }
  if (env.useBuildOptimizer) {
    src.push("with build optimization");
  }
  if (env.withServiceWorker) {
    src.push("with service worker");
  }
  return src.join(", ");
}

/** Stylesheets in .scss format may be loaded in two different ways:
 * (1) As CSS by inserting it into a <style> or a <link> tag. That's what happens to the "main.scss" file,
 * since it does not refer to a particular component only.
 * The <style> tag is used in development, to get proper HMR.
 * The <link> tag is used as optimization for the production modes.
 * (2) As an inline string - that what happens to all .component.scss files, since they refer
 * to a particular component, and inlining simplifies dealing with them.
 */
function applyStyleLoaders(config, ruleName, env, test) {
  return config.module
    .rule(ruleName)
    .test(test)
    .use("css-loader")
    .loader(require.resolve("css-loader"))
    .options({
      importLoaders: 1,
      minimize: !env.isDev,
      sourceMap: env.isDev
    })
    .end()
    .use("postcss-loader")
    .loader(require.resolve("postcss-loader"))
    .options({
      sourceMap: env.isDev
    })
    .end();
}

module.exports = env => {
  const config = new Config();

  config.entry("bundle").add(paths.resolveApp("src/main.ts"));

  // Configure output path - general config.
  config.output
    .path(env.outputDir)
    .publicPath(ensureEndingSlash(env.publicPath, true))
    .devtoolFallbackModuleFilenameTemplate(info =>
      path.relative(paths.appSrc, info.absoluteResourcePath)
    );

  // Configure output path - depending on mode.
  config.when(
    env.isDev,
    config => {
      // Development specific options.
      config.output
        .pathinfo(true)
        .filename("static/js/[name].js")
        .chunkFilename("static/js/[name].js");
    },
    config => {
      /**
       * Production specific options.
       * In general, [hash] identifies the whole build, whereas [chunkhash] identifies the particular chunk.
       * Using these is one way to simplify cache busting.
       *
       * See:
       *     https://webpack.js.org/configuration/output/#output-filename
       *     https://webpack.js.org/configuration/output/#output-chunkfilename
       */
      config.output
        .filename(`static/js/[name].[chunkhash:${env.hashDigits}].js`)
        .chunkFilename(`static/js/[name].[chunkhash:${env.hashDigits}].js`);
    }
  );

  // Bail on build failures in case we're NOT in development mode.
  config.bail(!env.isDev);

  // Disable performance hints - we're providing our own if required.
  config.performance.hints(false);

  // Set mode from process env.
  config.mode(process.env.NODE_ENV);

  // Configure devtool - source map.
  config.devtool(env.devtool);

  // Enable strict export presence.
  config.module.set("strictExportPresence", true);

  // Configure node options.
  config.node.merge(NODE_CONFIG);

  // Configure extensions to be resolved by default.
  config.resolve.extensions.merge(DEFAULT_RESOLVE_EXTENSIONS);

  // Configure loaders
  // prettier-ignore
  config
    .module
    .rule("lib-source-maps")
      // We should not use plain js files in our case, however,
      // some of the libs may contain them. We're interested in their source-maps.
      // In addition, the temporary files generated during AoT compilation while not using
      // the build optimizer don't have a source map file along.
      .test(/\.js$/)
      .use("sm-loader")
        .loader(require.resolve("source-map-loader"))
        .end()
      .exclude 
        .add(paths.resolveApp("node_modules/@angular"))
        .add(paths.resolveApp("node_modules/rxjs"))
        .add(/\.ng(factory|style).js$/)
        .end()
      .end()
    .rule("html-component")
      /**
       * HTML rule to load is loaded as-is, but evaluated to determine external references, e.g. to images.
       */
      .test(/\.html/)
      .use("html-loader")
        .loader(require.resolve("html-loader"))
        .end()
      .include.add(/\.component\.html$/).end()
      .end()
    .rule("images")
      /**
       * Directly referenced images are pushed through an appropriate minifier first,
       * and than path-adopted by the file-loader to get a fixed reference incl. hash.
       *
       * Note that this only aims at files in `src/assets`, since that folder is intended
       * for directly referenced resources.
       */
      .test(/\.(gif|png|jpe?g)$/i)
      .use("img-loader")
        .loader(require.resolve("file-loader"))
        .options({
          name: env.isDev
            ? "static/media/[name].[ext]"
            : `static/media/[name].[hash:${env.hashDigits}].[ext]`
        })
        .end()
      .include.add(paths.resolveApp("src", "assets")).end()
      .end();

  // More specialized: Style-related loaders.
  // CSS loading.
  const cssRule = applyStyleLoaders(config, "css-loading", env, /\.css$/);
  config.when(
    env.isDev,
    () =>
      cssRule
        .use("style-loader")
        .loader(require.resolve("style-loader"))
        .before("css-loader")
        .end(),
    () =>
      cssRule
        .use("mini-css-extract")
        .loader(MiniCssExtractPlugin.loader)
        .before("css-loader")
        .end()
  );

  // SCSS for components
  const scssComponentRule = applyStyleLoaders(
    config,
    "scss-component-loading",
    env,
    /\.component\.scss$/
  );
  scssComponentRule
    .use("to-string-loader")
    .loader(require.resolve("to-string-loader"))
    .before("css-loader")
    .end()
    .use("sass-loader")
    .loader(require.resolve("sass-loader"))
    .options({
      sourceMap: env.isDev,
      outputStyle: env.isDev ? "nested" : "compressed"
    })
    .end();

  // SCSS for general scss files
  const scssMainRule = applyStyleLoaders(
    config,
    "scss-main-loading",
    env,
    /\.scss$/
  );
  scssMainRule
    .use("sass-loader")
    .loader(require.resolve("sass-loader"))
    .options({
      sourceMap: env.isDev,
      outputStyle: env.isDev ? "nested" : "compressed"
    })
    .end()
    .include.add(paths.appGlobalStyles)
    .end();
  config.when(
    env.isDev,
    () =>
      scssMainRule
        .use("style-loader")
        .loader(require.resolve("style-loader"))
        .before("css-loader")
        .end(),
    () =>
      scssMainRule
        .use("mini-css-extract")
        .loader(MiniCssExtractPlugin.loader)
        .before("css-loader")
        .end()
  );

  // TS loading
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
  config.when(
    env.useAot,
    () => {
      /**
       * Loader for dealing with out typescript files in AoT mode.
       */
      config.module
        .rule("ts")
        .test(/\.ts$/)
        .use("aot-loader")
        .loader(require.resolve("@ngtools/webpack"))
        .end()
        .end();
    },
    config => {
      // prettier-ignore
      const res = config.module
        .rule("ts")
        .test(/\.ts$/)
          .use("ts-loader")
            .loader(require.resolve("ts-loader"))
            .options({
              silent: true,
              transpileOnly: env.isDev // Everything else is processed by the corresponding plugin.
            })
          .end()
          .use("angular-template-loader")
            .loader(require.resolve("angular2-template-loader"))
            .end()
          .use("angular-router-loader")
            .loader(require.resolve("angular-router-loader"))
          .end();

      if (env.isDev) {
        res
          .use("hmr-loader")
          .loader(require.resolve("@angularclass/hmr-loader"))
          .options({
            pretty: true
          })
          .before("ts-loader")
          .end();
      }
    }
  );

  // Optimization configuration.
  config.optimization.noEmitOnErrors(true).namedChunks(true);
  config.when(
    env.isDev,
    config => {
      // Use named modules to simplify debugging.
      config.optimization.namedModules(true);
    },
    config => {
      const terserOptions = getBasicTerserOptions();

      if (env.useBuildOptimizer) {
        terserOptions.compress.pure_getters = true;
        terserOptions.compress.passes = 3;
      }
      config.optimization
        .concatenateModules(true)
        .removeEmptyChunks(true)
        .splitChunks({
          // Create a vendor chunk.
          chunks: "all",
          name: "vendor"
        })
        // Creates a runtime chunk, containing name mappings and webpack runtime.
        .runtimeChunk({
          name: "runtime"
        })
        .minimize(true)
        .minimizer("terser")
        .use(require.resolve("terser-webpack-plugin"), [
          {
            terserOptions,
            sourceMap: env.devtool !== false,
            cache: true,
            parallel: true
          }
        ]);
    }
  );

  // Common plugins
  // prettier-ignore
  config
    .plugin("error-formatter")
      .use(ErrorFormatterPlugin, [])
      .end()
    .plugin("named-chunks") // Name lazily loaded chunks, in case they don't have a name yet.
      .use(NamedChunksPlugin, [chunkNameHandler()])
      .end()
    .plugin("html-plugin")
      .use(HtmlWebpackPlugin, [
        {
          template: paths.appHtml,
          filename: "index.html", // Keep in mind that the output path gets prepended to this name automatically.
          inject: "body",
          minify: env.isDev ? false : {
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
          },
          // Custom config.
          title: "Demo App",
          devMode: env.isDev,
          baseHref: env.baseHref,
          publicPath: ensureEndingSlash(env.publicPath, false),
          polyfillFile: "polyfills.dll.js",
          vendorFile: "vendor.dll.js",
          versionInfo: createVersionString(env)
        }
      ])
      .end()
    .plugin("script-ext-html")
      .use(ScriptExtHtmlWebpackPlugin, [{defaultAttribute: "defer"}])
      .end()
    .plugin("environment")
      .use(EnvironmentPlugin, [
        /**
         * Plugin to define several variables on "process.env". These are properly stringified automatically.
         * "process.env.NODE_ENV" is forwarded so that libraries may
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
        {
          NODE_ENV: process.env.NODE_ENV || "development",
          PUBLIC_PATH: env.publicPath,
          PUBLIC_URL: ensureEndingSlash(env.publicPath, false),
          USE_SERVICE_WORKER: !!env.withServiceWorker
        }
      ])
      .end()
    .plugin("case-sensitive-paths")
      .use(CaseSensitivePathsPlugin, [])
      .end()
    ;

  // Mode-specific plugins.

  // Fix the angular2 context w.r.t. to webpack and the usage of System.import in their "load a component lazily" code.
  // Note: Since a version > 1.2.4 of the @ngtools/webpack plugin, the context replacement conflicts with it (seems to deal with it itself).
  // Thus, we only add this plugin in case we're NOT aiming at AoT compilation.
  // TODO: Figure out if this is still required.
  config.when(!env.useAot, config => {
    config.plugin("context-replacement-angular").use(ContextReplacementPlugin, [
      /(.+)?angular(\\|\/)core(.+)?/, // Same as for universal rendering atm.
      paths.resolveApp("src")
    ]);
  });

  // process.env.CI is available on Travis & Appveyor.
  // On Travis, process.stdout.isTTY is `true`, but we don't want the progress
  // displayed there - it's irritating and does not work well.
  config.when(process.stdout.isTTY && !process.env.CI, config => {
    // Plugin for displaying bundle process stage.
    config
      .plugin("progress")
      .use(require.resolve("webpack/lib/ProgressPlugin"), [
        percent => {
          if (percent < 1) {
            buildLog.await(`[${Math.round(percent * 100)}%] Compiling...`);
          }
          // Note: 1.0 resp. 100% is not handled here, since that step is completed by
          // the `ErrorFormatterPlugin`.
        }
      ]);
  });

  config.when(!env.isDev && !env.useAot, config => {
    config
      .plugin("fork-ts-checker")
      .use(require.resolve("fork-ts-checker-webpack-plugin"), [
        {
          watch: paths.appSrc,
          async: env.isWatch,
          tsconfig: paths.resolveApp("tsconfig.json"),
          tslint: false,
          memoryLimit: process.env.APPVEYOR ? 1024 : 2048, // 2048 is too much for appveyor...,
          formatter: "codeframe",
          logger: {
            info: (...args) => {
              // Filter messages that are not that interesting in our case.
              if (
                args.length > 0 &&
                !/^(Starting|Version|Using|Watching)/.test(args[0])
              ) {
                asyncLog.info(...args);
              }
            },
            warn: (...args) => asyncLog.warn(...args),
            error: (...args) => asyncLog.error(...args)
          }
        }
      ]);
  });

  config.when(
    env.isDev,
    // For development mode only.
    config => {
      // These plugins are referencing the DLLs build from the definitions in dll.config.js .
      // Note that they are referencing the generated manifests and not the files themselves.
      const { DllReferencePlugin } = require("webpack");
      config.plugin("dll-ref-polyfills").use(DllReferencePlugin, [
        {
          context: ".",
          manifest: require(paths.resolveApp(".tmp/polyfills-manifest.json"))
        }
      ]);
      config.plugin("dll-ref-vendor").use(DllReferencePlugin, [
        {
          context: ".",
          manifest: require(paths.resolveApp(".tmp/vendor-manifest.json"))
        }
      ]);

      // Plugin for optimizing rebuild speed by caching e.g. configs.
      config.plugin("hard-source").use(
        require.resolve("hard-source-webpack-plugin", [
          {
            info: {
              level: "warn"
            }
          }
        ])
      );
    },
    // For production mode only.
    config => {
      // prettier-ignore
      config
        .module
        .rule("ignore-system-import-deprecation")
          // TODO: We'll have to remove this rule ASAP - but atm., not using this rule
          // causes a deprecation warning.
          // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
          // Removing this will cause deprecation warnings to appear.
          // Atm., this only appears in build mode.
          .test(/[\/\\]@angular[\/\\]core[\/\\].+\.js$/)
            .parser({"system": true})
            .end()
          .end()
        .plugin("stats-formatter")
          .use(require("./plugins/BuildStatsFormatterPlugin"), [{ ...env, log }])
          .end()
        // Cleanup output and build stats dir before build. Executes on the `compile` hook.
        .plugin("clean")
          .use(require("clean-webpack-plugin"), [
            [env.outputDir, env.statsDir],
            {
              root: paths.resolveApp(),
              verbose: false,
              // Required to get the `BuildStatsFormatterPlugin` working correctly - otherwise,
              // it could not pick up the previous output file paths.
              beforeEmit: true
            }
          ])
          .end()
        // Copies static assets to destination folder, ignoring the index template file
        // and the service worker origin.
        .plugin("copy-static")
          .use(require("copy-webpack-plugin"), [
            [
              {
                from: paths.appPublic + "/**/*",
                context: paths.appPublic,
                ignore: ["*.{ejs,html}", path.basename(paths.serviceWorkerScriptSrc)]
              }
            ]
          ])
          .end()
        /**
         * Plugin to extract styles as css files; We're using this for the main.scss only atm.
         * This may optimize loading time in production mode since it may be cached by the browser separately.
         *
         * See: https://github.com/webpack-contrib/mini-css-extract-plugin
         */
        .plugin("css-extract")
          .use(require("mini-css-extract-plugin"), [
            {
              filename: `static/css/[name].[contenthash:${env.hashDigits}].css`,
              chunkFilename: `static/css/[name].[contenthash:${env.hashDigits}].css`
            }
          ])
          .end()
        // Generate some information about the generated bundle size
        .plugin("bundle-analyzer")
          .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin, [
            {
              analyzerMode: "static",
              reportFilename: path.join(env.statsDir, "bundle-size-report.html"),
              openAnalyzer: false,
              generateStatsFile: true,
              statsFilename: path.join(env.statsDir, "bundle-size-report.json"),
              logLevel: "silent"
            }
          ])
          .end()
        // More consistent chunk hashes
        .plugin("chunk-hash")
          .use(require("webpack-chunk-hash"), [])
          .end()
        // Plugin to optimize CSS output - works even across multiple files,
        // since it is NOT an optimizer, which are (somewhat) limited to single files.
        .plugin("css-optimization")
          .use(require("@intervolga/optimize-cssnano-plugin"), [
            {
              sourceMap: env.devtool,
              cssnanoOptions: {
                preset: [
                  "default",
                  {
                    discardComments: {
                      removeAll: true
                    }
                  }
                ]
              }
            }
          ])
          .end();
    }
  );

  // Other production-specific stuff: Setup rxjs path mapping to optimize bundle size.
  config.when(!env.isDev, config => {
    // Setup rxPaths() for module.alias.
    const rxPaths = require("rxjs/_esm5/path-mapping");
    const rxResolvedPaths = rxPaths();
    for (const p in rxResolvedPaths) {
      if (rxResolvedPaths.hasOwnProperty(p)) {
        config.resolve.alias.set(p, rxResolvedPaths[p]);
      }
    }
  });

  // Generate a service worker with pre-cached resources information.
  config.when(env.withServiceWorker, config => {
    const { InjectManifest } = require("workbox-webpack-plugin");
    config.plugin("workbox").use(InjectManifest, [
      {
        // TODO: See if we can get "local" back to working - it currently fails
        // due to a blocked google-analytics module (which we do not even link ?!)
        importWorkboxFrom: "cdn",
        // globIgnores: ["**/*.map", "service-worker.js"],
        swDest: "service-worker.js",
        swSrc: paths.serviceWorkerScriptSrc
      }
    ]);
  });

  // HMR plugin, if mode active.
  config.when(env.isHot, config => {
    config
      .plugin("hmr")
      .use(require.resolve("webpack/lib/HotModuleReplacementPlugin"), []);
  });

  // Plugins depending on particular configuration, but potentially not only related to a mode.
  config.when(env.useAot, config => {
    const { AngularCompilerPlugin } = require("@ngtools/webpack");
    config.plugin("angular-compiler").use(AngularCompilerPlugin, [
      {
        tsConfigPath: paths.resolveApp("tsconfig.aot.json")
      }
    ]);
  });
  config.when(env.useBuildOptimizer, config => {
    config.module
      .rule("js-bo")
      .test(/\.js$/)
      .use("bo-loader")
      .loader("@angular-devkit/build-optimizer/webpack-loader")
      .options({ sourceMap: env.devtool !== false });
  });

  return config;
};
