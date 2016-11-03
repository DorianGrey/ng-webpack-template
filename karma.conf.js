const webpackTestConfig = require("./config/webpack.test.config");

const ENV       = process.env.NODE_ENV || "development";
const reporters = ["mocha", "coverage", "remap-coverage"];
if ("production" === ENV) {
  reporters.push("junit");
}

module.exports = config => {
  const configuration = {
    basePath: "",
    frameworks: ["jasmine"],

    files: [
      {pattern: "./src/test-setup.js", watched: false}
    ],
    exclude: [],
    preprocessors: {
      "./src/test-setup.js": ["coverage", "webpack", "sourcemap"]
    },
    webpack: webpackTestConfig,
    webpackServer: {noInfo: true},

    reporters: reporters,

    coverageReporter: {
      type: "in-memory"
    },

    remapCoverageReporter: {
      "text-summary": null,
      json: "./test-results/coverage/coverage.json",
      html: "./test-results/coverage/html"
    },
    junitReporter: {
      outputDir: "./test-results/junit"
    },

    mochaReporter: {
      output: "minimal"
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: ENV === "development",
    browsers: ["PhantomJS"],
    singleRun: ENV === "production"
  };

  config.set(configuration);
};
