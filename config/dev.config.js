const yargs = require("yargs");
const paths = require("./paths");

// A list of keys that are used for configuration, but might not be overridden.
const nonOverridableKeys = ["isDev", "isWatch", "useAot"];
const buildConfig = {
  outputDir: paths.devTmp,
  devtool: "inline-source-map",
  useAot: false,
  isDev: true,
  isWatch: true,
  isHot: true,
  publicPath: "/",
  baseHref: "/",
  port: 9987
};

function isValidOptionOverride(key, value) {
  switch (key) {
    case "devtool":
      const type = typeof value;
      return type === "string" || type === "boolean";
    default:
      return typeof buildConfig[key] === typeof value;
  }
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
    isDev: {
      default: buildConfig.isDev,
      type: "boolean"
    },
    isWatch: {
      default: buildConfig.isWatch,
      type: "boolean"
    },
    isHot: {
      default: buildConfig.isHot,
      type: "boolean"
    }
  };
};

module.exports.parseFromCLI = function() {
  return module.exports(
    yargs.options(module.exports.getSpecialYargsOptions()).argv
  );
};
