# Known issues and how to solve them

## Unit tests: Electron cannot be started

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