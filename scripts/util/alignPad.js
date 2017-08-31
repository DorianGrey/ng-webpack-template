const stripAnsi = require("strip-ansi");

function alignPad(originalLabel, to) {
  let sizeLength = stripAnsi(originalLabel).length;
  if (sizeLength < to) {
    const rightPadding = " ".repeat(to - sizeLength);
    originalLabel += rightPadding;
  }
  return originalLabel;
}

module.exports = alignPad;
