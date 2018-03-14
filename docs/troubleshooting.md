# Known issues and how to solve them

## Unit tests: Jest

Release 18.0.0 introduced `jest` for executing unit tests. By default, it uses [JSDOM](https://github.com/jsdom/jsdom) for providing a DOM-tree while running on `node`. Since this is not a real DOM, some components under test may require additional mocks or configuration, though most stuff should work out of the box.
The test runner utilizes the [jest-preset-angular](https://github.com/thymikee/jest-preset-angular) preset, so that project's [troubleshooting guide](https://github.com/thymikee/jest-preset-angular#troubleshooting) should be the first to look for any known issue yet.
- The `jestGlobalMocks` file can be found in the `config/jest` directory.
- `jest` itself is configured via the `jest.config.js` in the project's root directory instead of a property in the `package.json`.

Most problems with suddenly (i.e.: after migration) failing tests are caused by globals required from your code or the libraries you are using that are not - or at least not properly - defined. Those can be added or modified in `jestGlobalMocks`. You may also assign to global variables here, like `window.$` when using `jquery`.
If your tests are still failing, you might try to debug them resp. the test execution itself. Most of this is described in the [jest troubleshooting guide](https://facebook.github.io/jest/docs/en/troubleshooting.html). This project contains two debugging capabilities by default:
- Debugging via Chrome: Use the `test:debug` task and follow the instructions [here](https://nodejs.org/en/docs/inspector/#chrome-devtools). Note that this isn't that comfortable, since it requires setting `debugger` statements manually.
- Debugging via VSCode: Use the provided launch configuration to do so. Set up your breakpoints as you would normally do.

## Unit tests: Electron cannot be started (affects 12.0.0 <= version < 18.0.0)

The usabilty changes after release 12.0.0 included a move from phantomjs to electron as default browser for executing the unit tests. Phantomjs does not seem to be active maintained any longer, since the last release is older than a year, although there is a large list of open issues. That's why we decided to replace it by electron.

However, although electron run in non-window mode, it still requires a real display, either a virtual or a real one. This might cause problems on several CI systems, since they do not provide one by default. That does not seem to be a problem on windows (at least the `appveyor` build worked without any further configuration), but it definitely happens on various linux systems. Thus, you will need a way to provide a virtual display. [Xvfb](https://linux.die.net/man/1/xvfb) does a good job for this. You might have recognized these lines in the travis configuration:
```
  - export DISPLAY=:99.0
  - sh -e /etc/init.d/xvfb start
```
That's one way to start it before executing your unit test. Alternatively, you may [this](https://www.npmjs.com/package/xvfb) npm package to wrap your unit test execution. Below is an example of how this might look like, based on the current `test.js` script.
```javascript
let xvfb = null;
function startXvfb() {
  xvfb = new XvfbCtor();
  return new Promise((resolve, reject) => {
    xvfb.start(err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function stopXvfb(exitCode) {
  return new Promise((resolve, reject) => {
    xvfb.stop(err => {
      if (err) {
        reject(err);
      } else {
        resolve(exitCode);
      }
     });
  });
}

function runKarma() {
  const karmaConfig = config.parseConfig(paths.resolveApp("karma.conf.js"));
  return new Promise(resolve => {
  const server = new Server(karmaConfig, function(exitCode) {
    resolve(exitCode);
  });
    server.start();
  });
}

const withCoverage = /ci$/i.test(process.env.npm_lifecycle_event);
const started = withCoverage
  ? fs.emptyDir(paths.resolveApp("test-results"))
  : Promise.resolve();

started
  .then(startXvfb)
  .then(() =>
    compileTranslations("src/**/*.i18n.yml", "src/generated/translations.ts")
  )
  .then(runKarma)
  .then(stopXvfb)
;


```