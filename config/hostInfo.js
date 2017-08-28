/*
 Note: To avoid security problems, we have to explicitly set our public IP.
 Thus, we have to determine it from the available network interfaces.
 For simplicity, we're picking up the first matching address
 */
const ifaces = require("os").networkInterfaces();

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

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 9987;
const HOST = process.env.HOST || "0.0.0.0";

const PUBLIC_ADDRESS = selectPublicAddress(HOST);

module.exports = {
  DEFAULT_PORT,
  HOST,
  PUBLIC_ADDRESS
};
