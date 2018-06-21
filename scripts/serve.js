"use strict";

const Koa = require("koa");
const compress = require("koa-compress");
const serveStatic = require("@shellscape/koa-static/legacy"); // Already used by webpack-serve, thus...
const proxy = require("koa-proxies");
const history = require("connect-history-api-fallback");
const convert = require("koa-connect");

const yargs = require("yargs");

const { selectPort } = require("../config/hostInfo");
const { log } = require("../config/logger");
const buildConfig = require("../config/build.config").parseFromCLI();

const intendedPort = yargs.argv.port || 9988;

selectPort(intendedPort).then(serverPort => {
  const app = new Koa();
  const serveDir = buildConfig.outputDir;

  app
    .use(convert(history({}))) // HTML5 fallback
    .use(serveStatic(serveDir)) // Serve static dir
    .use(compress()); // Use compression.
  const proxyRules = require("./util/proxy");

  Object.getOwnPropertyNames(proxyRules).forEach(proxyPath => {
    app.use(proxy(proxyPath, proxyRules[proxyPath]));
  });

  app.listen(serverPort, () => {
    log.info(`Serving files from ${serveDir} ...`);
    log.info(`Listening on http://localhost:${serverPort} ...`);
  });
});
