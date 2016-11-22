"use strict";

const express = require("express");
const path    = require("path");
const logger  = require("log4js").getLogger("server");

const serverPort = 9988;

const app = express();

app.use(require("./proxy"));
app.use(express.static("./dist"));
app.get("*", (req, res) => res.sendFile(path.resolve("dist/index.html")));

app.listen(serverPort, () => logger.info(`Listening on http://localhost:${serverPort} ...`));