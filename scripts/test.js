const fs = require("fs-extra");
const { Server } = require("karma");

const compileTranslations = require("./translations").compile;
const paths = require("../config/paths");

function runKarma() {
  const server = new Server(
    { configFile: paths.resolveApp("karma.conf.js") },
    function(exitCode) {
      process.exit(exitCode);
    }
  );

  server.start();
}

const withCoverage = /ci$/i.test(process.env.npm_lifecycle_event);

const started = withCoverage
  ? fs.emptyDir(paths.resolveApp("test-results"))
  : Promise.resolve();

started
  .then(() =>
    compileTranslations("src/**/*.i18n.yml", "src/generated/translations.ts")
  )
  .then(() => {
    runKarma();
  });
