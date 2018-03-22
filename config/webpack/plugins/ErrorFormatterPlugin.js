const statsFormatter = require("../../../scripts/util/statsFormatter");
const formatWebpackMessages = require("../../../scripts/util/formatWebpackMessages");
const formatUtil = require("../../../scripts/util/formatUtil");

const writer = process.stdout.write.bind(process.stdout);

function hookToCompiler(compiler, event, callback) {
  if (compiler.hooks[event]) {
    compiler.hooks[event].tap("ErrorFormatterPlugin", callback);
  } else {
    compiler.on(event, callback);
  }
}

class ErrorFormatterPlugin {
  constructor(options) {
    this.options = options || {};
    this.options.successMessages = this.options.successMessages || [];
    this.options.clear = this.options.clear || {};
    this.options.clear.mode = this.options.clear.mode || "soft";
    this.options.clear.onInvalid =
      typeof this.options.clear.onInvalid === "boolean"
        ? this.options.clear.onInvalid
        : true;
    this.options.clear.onDone =
      typeof this.options.clear.onDone === "boolean"
        ? this.options.clear.onDone
        : false;

    this.cls =
      this.options.clear.mode === "soft" ? formatUtil.cls : formatUtil.hardCls;
  }

  apply(compiler) {
    const onDone = stats => {
      this.options.clear.onDone && this.cls();
      const hasErrors = stats.hasErrors();
      const hasWarnings = stats.hasWarnings();

      if (!hasErrors && !hasWarnings) {
        const time = getCompileTime(stats);
        writer("\n");
        writer(
          `${formatUtil.formatSuccess(
            `Compiled successfully in ${time} ms.`
          )}\n`
        );

        if (this.options.successMessages.length > 0) {
          writer("\n");
          this.options.successMessages.forEach(msg => {
            writer(`${formatUtil.formatNote(msg)}\n`);
          });
          writer("\n");
        }

        return;
      }
      this.displayMalfunctions(hasErrors, hasWarnings, stats);
    };

    const onInvalid = () => {
      this.options.clear.onInvalid && this.cls();
      writer(`${formatUtil.formatInfo("Compiling...")}\n`);
    };

    hookToCompiler(compiler, "done", onDone);
    hookToCompiler(compiler, "invalid", onInvalid);
  }

  displayMalfunctions(hasErrors, hasWarnings, stats) {
    const jsonified = formatWebpackMessages(stats.toJson({}, true));
    const formattedStats = statsFormatter.formatStats(jsonified);

    if (hasWarnings) {
      writer("\n");
      statsFormatter.printWarnings(formattedStats.warnings, writer);
    }

    if (hasErrors) {
      writer("\n");
      statsFormatter.printErrors(formattedStats.errors, writer);
    }
  }
}

function getCompileTime(stats) {
  if (stats.stats) {
    // Webpack multi compilations run in parallel so using the longest duration.
    // https://webpack.github.io/docs/configuration.html#multiple-configurations
    return stats.stats.reduce(
      (time, stats) => Math.max(time, getCompileTime(stats)),
      0
    );
  }
  return stats.endTime - stats.startTime;
}

module.exports = ErrorFormatterPlugin;
