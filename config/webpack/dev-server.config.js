const paths = require("../paths");

// For further config see here: https://github.com/webpack/docs/wiki/webpack-dev-server#api
module.exports = {
  port: 9987,
  historyApiFallback: true,
  contentBase: [paths.resolveApp("src"), paths.resolveApp(".tmp"), paths.resolveApp("")],
  // TODO: Maybe add more of the options mentioned here: https://github.com/webpack/webpack-dev-server/issues/68#issuecomment-75323551
  stats: "minimal"
};
