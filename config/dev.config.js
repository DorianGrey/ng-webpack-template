const paths = require("./paths");

const buildConfig = {
  outputDir: paths.devTmp,
  disableLongTermCaching: false,
  devtool: "inline-source-map",
  useAot: false,
  isDev: true,
  isWatch: true,
  publicUrl: "",
  baseHref: "/"
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
    if (env.hasOwnProperty(key) && isValidOptionOverride(key, env[key])) {
      result[key] = env[key];
    } else {
      result[key] = buildConfig[key];
    }
  });

  return result;
};
