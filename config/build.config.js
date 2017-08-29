const paths = require("./paths");

// A list of keys that are used for configuration, but might not be overridden.
const nonOverridableKeys = ["isDev", "isWatch"];
const buildConfig = {
  outputDir: paths.resolveApp("build"),
  statsDir: paths.resolveApp("buildStats"),
  disableLongTermCaching: false,
  devtool: "source-map",
  useAot: true,
  useBuildOptimizer: false,
  isDev: false,
  isWatch: false,
  publicUrl: "",
  baseHref: "/",
  hashDigits: 12,
  // The asset categorization map.
  // Just set to "false" to not categorize the build output.
  // categorizeAssets: false,
  categorizeAssets: {
    "Service worker": /(workbox|service-worker).*\.js$/,
    Scripts: /\.js$/,
    Styles: /\.css$/,
    "Source maps": /\.map$/,
    Favicons: /favicon(\d+x\d+)?\.png$/,
    Images: /\.(jpe?g|png|gif|bmp)$/,
    Fonts: /\.(woff2?|eot|ttf|svg)$/
  },
  assetsSizeWarnLimit: 250 * 1024, // <=> 250 KB.
  potentiallyExtractedChunkSizeLimit: 512, // <=> 512 Byte.
  // This gzip level is used heavily, i.e. by nginx, so it makes sense
  // to take it as a reference.
  gzipDisplayOpts: { level: 6 }
};

function isValidOptionOverride(key, value) {
  switch (key) {
    case "devtool":
      const type = typeof value;
      return type === "string" || type === "boolean";
    case "categorizeAssets":
      return typeof value === "object" || value === false;
      break;
    default:
      return typeof buildConfig[key] === typeof value;
  }
}

function sanitizeOptions(result) {
  // A level outside of the 1..9 range may yield curious results...
  result.gzipDisplayOpts.level = Math.max(
    1,
    Math.min(result.gzipDisplayOpts.level, 9)
  );
}

module.exports = function(env = {}) {
  const result = {};
  Object.getOwnPropertyNames(buildConfig).forEach(key => {
    if (
      env.hasOwnProperty(key) &&
      isValidOptionOverride(key, env[key]) &&
      !nonOverridableKeys.includes(key)
    ) {
      result[key] = env[key];
    } else {
      result[key] = buildConfig[key];
    }
  });

  sanitizeOptions(result);

  return result;
};
