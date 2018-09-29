"use strict";

const express = require("express");
const path = require("path");
const yargs = require("yargs");
const proxy = require("http-proxy-middleware");

const { selectPort } = require("../config/hostInfo");
const { log } = require("../config/logger");
const buildConfig = require("../config/build.config").parseFromCLI();
const proxyCfg = require("./util/proxy");

const intendedPort = yargs.argv.port || 9988;

selectPort(intendedPort).then(serverPort => {
  const app = express();
  const serveDir = buildConfig.outputDir;

  // Configure proxy configuration, if any provided.
  Object.getOwnPropertyNames(proxyCfg).forEach(path => {
    app.use(path, proxy({ target: proxyCfg[path] }));
  });
  app.use(
    buildConfig.publicPath,
    express.static(path.resolve(process.cwd(), serveDir))
  );

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(serveDir + "/index.html"))
  );

  app.listen(serverPort, () => {
    log.info(`Serving files from ${serveDir} ...`);
    log.info(`Listening on http://localhost:${serverPort} ...`);
  });
});
