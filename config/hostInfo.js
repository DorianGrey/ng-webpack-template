/*
 Note: To avoid security problems, we have to explicitly set our public IP.
 */
const internalIp = require("internal-ip");
const detectPort = require("detect-port");
const chalk = require("chalk");

const { log } = require("./logger");

const LOCAL_HOST_ADDRESS = process.env.HOST || "localhost";
const PUBLIC_ADDRESS = internalIp.v4.sync();
const useLocalIp = process.argv.indexOf("--local-network") !== -1;

function selectPort(requested) {
  return new Promise((resolve, reject) => {
    detectPort(requested, (err, foundPort) => {
      if (err) {
        reject(err);
      } else {
        if (requested !== foundPort) {
          log.note(
            `Port ${chalk.cyan(
              requested.toString()
            )} was occupied, selected ${chalk.cyan(foundPort)} instead.`
          );
        }
        resolve(foundPort);
      }
    });
  });
}

module.exports = {
  selectPort,
  useLocalIp,
  LOCAL_HOST_ADDRESS,
  PUBLIC_ADDRESS
};
