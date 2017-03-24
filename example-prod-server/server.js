"use strict";

const express = require("express");
const path    = require("path");
const logger  = require("log4js").getLogger("server");

const serverPort = 9988;

const app = express();

const serveDirs = process.argv.slice(2);
if (serveDirs.length === 0) {
  serveDirs.push("./dist");
}

app.use(require("./proxy"));

serveDirs.forEach((dirName) => {
  app.use(express.static(path.resolve(process.cwd(), dirName)));
});

app.get("*", (req, res) => res.sendFile(path.resolve(serveDirs[0] + "/index.html")));

app.listen(serverPort, () => logger.info(`Listening on http://localhost:${serverPort} ...`));