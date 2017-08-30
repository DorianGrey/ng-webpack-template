"use strict";

const express = require("express");
const yargs = require("yargs");
const path = require("path");
const logger = require("log4js").getLogger("server");
logger.level = "debug";

const { selectPort } = require("../config/hostInfo");
const buildConfig = require("../config/build.config")(yargs.argv);

const intendedPort = yargs.argv.port || 9988;

selectPort(intendedPort).then(serverPort => {
  const app = express();

  const serveDir = buildConfig.outputDir;

  app.use(require("./util/proxy"));
  app.use(
    buildConfig.publicPath,
    express.static(path.resolve(process.cwd(), serveDir))
  );

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(serveDir + "/index.html"))
  );

  app.listen(serverPort, () => {
    logger.info(`Serving files from ${serveDir} ...`);
    logger.info(`Listening on http://localhost:${serverPort} ...`);
  });
});
