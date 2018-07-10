const paths = require("../paths");
const history = require("connect-history-api-fallback");
const convert = require("koa-connect");
const compress = require("koa-compress");

// For further config see here: https://github.com/webpack/docs/wiki/webpack-dev-server#api
module.exports = function(host, port, publicPath, isHot) {
  return {
    content: [
      paths.resolveApp("public"),
      paths.resolveApp("src"),
      paths.resolveApp(".tmp"),
      paths.resolveApp("")
    ],
    devMiddleware: {
      publicPath,
      logLevel: "silent",
      stats: "errors-only"
    },
    hotClient: isHot
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
