const yargs = require("yargs");
const paths = require("./paths");

// A list of keys that are used for configuration, but might not be overridden.
const nonOverridableKeys = ["isDev", "isWatch"];
const buildConfig = {
  outputDir: paths.resolveApp("build"),
  statsDir: paths.resolveApp("buildStats"),
  devtool: "source-map",
  useAot: true,
  useBuildOptimizer: true,
  isDev: false,
  isWatch: false,
  publicPath: "/",
  baseHref: "/",
  hashDigits: 12,
  withServiceWorker: true,
  withExperimentalCssOptimization: false,
  // The asset categorization map.
  // Just set to "false" to not categorize the build output.
  // categorizeAssets: false,
  categorizeAssets: {
    "Service worker": /(workbox|service-worker|precache-manifest).*\.js$/,
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

/**
 * Helper function to determine which serve-relevant fields
 * differ from the default configuration. Is used e.g. for
 * printing the preview information.
 *
 * @param compare The build config to compare to.
 */
module.exports.getNonDefaultFields = function(compare) {
  const result = {};
  ["outputDir", "publicPath"].map(field => {
    if (compare[field] !== buildConfig[field]) {
      result[field] = compare[field];
    }
  });

  return result;
};

// By default, yargs might parse boolean values as strings
// if provided via cli. To enforce a proper type, those have to be listed here.
// Note that any other config entry will be parsed in the default way.
module.exports.getSpecialYargsOptions = function() {
  return {
    useAot: {
      default: buildConfig.useAot,
      type: "boolean"
    },
    useBuildOptimizer: {
      default: buildConfig.useBuildOptimizer,
      type: "boolean"
    },
    isDev: {
      default: buildConfig.isDev,
      type: "boolean"
    },
    isWatch: {
      default: buildConfig.isWatch,
      type: "boolean"
    },
    hashDigits: {
      default: buildConfig.hashDigits,
      type: "number"
    },
    withServiceWorker: {
      default: buildConfig.withServiceWorker,
      type: "boolean"
    }
  };
};

module.exports.parseFromCLI = function() {
  return module.exports(
    yargs.options(module.exports.getSpecialYargsOptions()).argv
  );
};
