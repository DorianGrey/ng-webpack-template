const paths = require("../paths");
const { PUBLIC_ADDRESS } = require("../hostInfo");

// For further config see here: https://github.com/webpack/docs/wiki/webpack-dev-server#api
module.exports = function(publicPath, port) {
  return {
    publicPath,
    port,
    historyApiFallback: true,
    contentBase: [
      paths.resolveApp("public"),
      paths.resolveApp("src"),
      paths.resolveApp(".tmp"),
      paths.resolveApp("")
    ],
    host: "::",
    public: `${PUBLIC_ADDRESS}:${port}`,
    stats: "minimal",
    watchOptions: {
      ignored: /node_modules/
    },
    compress: true,
    inline: true,
    hot: true,
    clientLogLevel: "none",
    quiet: true
  };
};
