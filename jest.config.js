module.exports = {
  "collectCoverageFrom": [
    "src/**/*.{js,ts}",
    "!src/**/*.spec.{js,ts}",
    "!src/**/*.d.ts",
    "!src/main.ts"
  ],
  "coverageDirectory": "<rootDir>/test-results/coverage",
  "coverageReporters": [
    "lcovonly",
    "json",
    "html",
    "cobertura",
    "text",
    "text-summary"
  ],
  "globals": {
    "ts-jest": {
      "tsConfigFile": "tsconfig.spec.json"
    },
    "__TRANSFORM_HTML__": true
  },
  "moduleFileExtensions": [
    "js",
    "ts",
    "html"
  ],
  "moduleDirectories": [
    "node_modules",
    "src"
  ],
  "reporters": ["default", "jest-junit"],
  "setupTestFrameworkScriptFile": "<rootDir>/config/jest/testSetup.ts",
  "testMatch": [
    "<rootDir>/src/**/?(*.)spec.ts"
  ],
  "testURL": "http://localhost/",
  "transform": {
    "^.+\\.(ts|html)$": "<rootDir>/node_modules/jest-preset-angular/preprocessor.js"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!@ngrx)"
  ]
};