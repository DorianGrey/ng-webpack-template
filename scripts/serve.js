"use strict";

const express = require("express");
const yargs = require("yargs");
const path = require("path");
const logger = require("log4js").getLogger("server");
logger.level = "debug";
const buildConfig = require("../config/build.config")(yargs.argv);

const serverPort = yargs.argv.port || 9988;

const app = express();

const serveDirs = [buildConfig.outputDir];

app.use(require("./util/proxy"));

serveDirs.forEach(dirName => {
  app.use(express.static(path.resolve(process.cwd(), dirName)));
});

app.get("*", (req, res) =>
  res.sendFile(path.resolve(serveDirs[0] + "/index.html"))
);

app.listen(serverPort, () =>
  logger.info(`Listening on http://localhost:${serverPort} ...`)
);
