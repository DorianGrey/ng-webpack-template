const fs = require("fs-extra");
const { Server, config } = require("karma");

const compileTranslations = require("../dev/translations").compile;
const paths = require("../config/paths");

function runKarma() {
  const karmaConfig = config.parseConfig(paths.resolveApp("karma.conf.js"));

  const server = new Server(karmaConfig, function(exitCode) {
    process.exit(exitCode);
  });

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
