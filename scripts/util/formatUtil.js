"use strict";

const chalk = require("chalk");
const readline = require("readline");

/**
 * Fill screen with blank lines, move to "0" afterwards and clear screen afterwards.
 * Note that it is still possible to "scroll back" afterwards.
 *
 * Function performs nothing in case the stdout is NOT a TTY.
 */
exports.cls = function() {
  if (process.stdout.isTTY) {
    const blank = "\n".repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
  }
};

/**
 * A less soft version of `cls` above which completely clears out the screen,
 * without leaving the option to scroll up again.
 *
 * Function performs nothing in case the stdout is NOT a TTY.
 */
exports.hardCls = function() {
  if (process.stdout.isTTY) {
    process.stdout.write(
      process.platform === "win32" ? "\x1Bc" : "\x1B[2J\x1B[3J\x1B[H"
    );
  }
};

exports.formatFirstLineMessage = function(text) {
  return chalk.bgWhite.black(text);
};
