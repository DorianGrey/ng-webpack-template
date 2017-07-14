const commons = require("./constants");

// For further config see here: https://github.com/webpack/docs/wiki/webpack-dev-server#api
module.exports = {
  port: 9987,
  historyApiFallback: true,
  contentBase: [commons.root("src"), commons.root(".tmp"), commons.root("")],
  // TODO: Maybe add more of the options mentioned here: https://github.com/webpack/webpack-dev-server/issues/68#issuecomment-75323551
  stats: {
    colors: true,
    chunks: false
  }
};
