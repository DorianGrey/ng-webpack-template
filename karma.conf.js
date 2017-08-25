const withCoverage = /ci$/i.test(process.env.npm_lifecycle_event);
const isWatchMode = process.argv.indexOf("--watch") > -1;

const webpackTestConfig = require("./config/webpack/test.config");

const noCoverageConfig = {
  // In dev mode, we don't need to see the coverage stuff on every run ...
  preprocessors: {
    "./src/test-setup.js": ["webpack", "sourcemap"]
  },
};
const withCoverageConfig = {
  // In prod-test mode, we do want to see and store the coverage, thus ...
  preprocessors: {
    "./src/test-setup.js": ["coverage", "webpack", "sourcemap"]
  },
  coverageReporter: {
    type: "in-memory"
  },
  remapIstanbulReporter: {
    reports: {
      "text-summary": null,
      lcovonly: "./test-results/coverage/lcov.info",
      json: "./test-results/coverage/coverage.json",
      html: "./test-results/coverage/html/",
      cobertura: "./test-results/coverage/coverage.xml"
    }
  },
  // The junit reporter is primarily used to provide a report that may be picked
  // up be almost every tool that can handle XUnit conforming reports. E.g. CI systems like Jenkins
  // have several plugins for this part of the process.
  junitReporter: {
    outputDir: "./test-results/junit"
  }
};

module.exports = config => {
  const baseConfig = {
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      {pattern: "./src/test-setup.js", watched: false}
    ],
    exclude: [],
    webpack: webpackTestConfig,
    webpackServer: {noInfo: true},
    // See the comments above for an explanation of this difference.
    reporters: withCoverage ? ["mocha", "coverage", "karma-remap-istanbul", "junit"] : ["mocha"],
    mochaReporter: {
      output: "minimal"
    },
    port: 9876,
    colors: true,
    // Reduce output noise to a minimum in dev mode, so that the results are easier to keep an eye on.
    logLevel: withCoverage ? config.LOG_INFO : config.LOG_WARN,
    autoWatch: isWatchMode,
    browsers: ["Electron"],
    singleRun: !isWatchMode
  };

  config.set(
    Object.assign(baseConfig, withCoverage ? withCoverageConfig : noCoverageConfig)
  );
};
