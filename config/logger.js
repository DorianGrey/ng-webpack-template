const signale = require("signale");

const log = new signale.Signale({
  stream: process.stdout,
  types: {
    category: {
      badge: ">",
      color: "cyan",
      label: "category"
    }
  }
});
const buildLog = new signale.Signale({
  // Only use interactive mode in case the stdout is a TTY and
  // not on a CI system - the .isTTY often yields "true" on these,
  // even though they do NOT fully support it.
  interactive: process.stdout.isTTY && !process.env.CI
});
const asyncLog = signale.scope("async");

module.exports = {
  log,
  buildLog,
  asyncLog
};
