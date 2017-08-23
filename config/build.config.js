const paths = require("./paths");

const buildConfig = {
  outputDir: paths.resolveApp("build"),
  statsDir: paths.resolveApp("buildStats"),
  disableLongTermCaching: false,
  devtool: false,
  useAot: true,
  useBuildOptimizer: false,
  useClosureCompiler: false,
  isDev: false,
  isWatch: false
};

module.exports = function(env = {}) {
  const result = {};
  Object.getOwnPropertyNames(buildConfig)
    .forEach(key => {
      if (env.hasOwnProperty(key)) {
        result[key] = env[key];
      } else {
        result[key] = buildConfig[key];
      }
    });

  return result;
};