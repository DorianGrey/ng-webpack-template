/*
 Note: To avoid security problems, we have to explicitly set our public IP.
 Thus, we have to determine it from the available network interfaces.
 For simplicity, we're picking up the first matching address
 */
const ifaces = require("os").networkInterfaces();
const detectPort = require("detect-port");
const chalk = require("chalk");

const formatUtils = require("../scripts/util/formatUtil");

function determinePublicAddress() {
  // Iterate over interfaces ...
  let publicAddresses = [];
  for (let dev in ifaces) {
    if (ifaces.hasOwnProperty(dev)) {
      const addresses = ifaces[dev]
        .filter(
          details => details.family === "IPv4" && details.internal === false
        )
        .map(iface => iface.address);
      publicAddresses.push(...addresses);
    }
  }

  let publicAddress;
  if (publicAddresses.length > 0) {
    publicAddress = publicAddresses[0];
  } else {
    console.warn(
      "Unable to determine public address, falling back to 127.0.0.1!"
    );
    publicAddress = "127.0.0.1";
  }

  return publicAddress;
}

function selectPublicAddress(defaultHost) {
  switch (defaultHost) {
    case "0.0.0.0":
    case "127.0.0.1":
    case "localhost":
      return determinePublicAddress();
      break;
    default:
      console.log(
        `Selected default host=${defaultHost} is neither local nor wildcard, skipping host determination...`
      );
      return defaultHost;
  }
}

const HOST = process.env.HOST || "0.0.0.0";
const PUBLIC_ADDRESS = selectPublicAddress(HOST);

function selectPort(requested) {
  return new Promise((resolve, reject) => {
    detectPort(requested, (err, foundPort) => {
      if (err) {
        reject(err);
      } else {
        if (requested !== foundPort) {
          process.stdout.write(
            formatUtils.formatNote(
              `Port ${chalk.cyan(
                requested.toString()
              )} was occupied, selected ${chalk.cyan(foundPort)} instead.`
            ) + "\n"
          );
        }
        resolve(foundPort);
      }
    });
  });
}

module.exports = {
  HOST,
  PUBLIC_ADDRESS,
  selectPort
};
