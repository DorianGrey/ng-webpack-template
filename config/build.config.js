const paths = require("./paths");

const buildConfig = {
  outputDir: paths.resolveApp("build"),
  statsDir: paths.resolveApp("buildStats"),
  disableLongTermCaching: false,
  devtool: "source-map",
  useAot: true,
  useBuildOptimizer: false,
  useClosureCompiler: false,
  isDev: false,
  isWatch: false,
  publicPath: "/",
  // The asset categorization map.
  // Just set to "false" to not categorize the build output.
  // categorizeAssets: false,
  categorizeAssets: {
    "Service worker": /(workbox|service-worker).*\.js$/,
    Scripts: /\.js$/,
    Styles: /\.css$/,
    "Source maps": /\.map$/,
    Images: /\.(jpe?g|png|gif|bmp)$/,
    Fonts: /\.(woff2?|eot|ttf|svg)$/
  },
  assetsSizeWarnLimit: 250 * 1024, // <=> 250 KB.
  potentiallyExtractedChunkSizeLimit: 512, // <=> 512 Byte.
  // This gzip level is used heavily, i.e. by nginx, so it makes sense
  // to take it as a reference.
  gzipDisplayOpts: { level: 6 }
};

module.exports = function(env = {}) {
  const result = {};
  // TODO: We need to validate the `env` content.
  Object.getOwnPropertyNames(buildConfig).forEach(key => {
    if (env.hasOwnProperty(key)) {
      result[key] = env[key];
    } else {
      result[key] = buildConfig[key];
    }
  });
  // TODO: We have to perform a "sanity" check here, e.g. for build optimizer.

  return result;
};
