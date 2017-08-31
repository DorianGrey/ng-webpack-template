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
