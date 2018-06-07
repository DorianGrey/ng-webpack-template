const paths = require("../paths");
const history = require("connect-history-api-fallback");
const convert = require("koa-connect");
const compress = require("koa-compress");

// For further config see here: https://github.com/webpack/docs/wiki/webpack-dev-server#api
module.exports = function(publicPath, port, isHot) {
  const host = "localhost";
  return {
    content: [
      paths.resolveApp("public"),
      paths.resolveApp("src"),
      paths.resolveApp(".tmp"),
      paths.resolveApp("")
    ],
    dev: {
      publicPath,
      logLevel: "silent",
      stats: "errors-only"
    },
    hot: isHot
      ? {
          logLevel: "silent",
          host
        }
      : false,
    port,
    logLevel: "error",
    logTime: false,
    host,
    add: (app, middleware, options) => {
      const historyOptions = {
        // ... see: https://github.com/bripkens/connect-history-api-fallback#options
      };

      app.use(convert(history(historyOptions)));
      app.use(compress());
    }
  };
};
