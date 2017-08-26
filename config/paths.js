const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (...relativePath) =>
  path.resolve(appDirectory, ...relativePath);

const resolveConfig = (...relativePath) =>
  path.resolve(appDirectory, "config", ...relativePath);

module.exports = {
  resolveApp,
  resolveConfig,
  appSrc: resolveApp("src"),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public", "index.ejs"),
  configDir: resolveConfig(),
  appStyleLintOptions: resolveConfig("stylelint.config.js"),
  yarnLockFile: resolveApp("yarn.lock")
};
