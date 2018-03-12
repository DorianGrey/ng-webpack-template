# Project changes after 12.0.0

## Structural changes
This list contains the changes in the file and directory structure. You might follow this in case you have made any changes to the default setup.

### webpack
- `/webpack` => `/config/webpack`
- `/webpack/_common.config.js` => `/config/webpack/common.js`
- `/webpack/_dev.config.js` => `/config/webpack/dev.js`
- `/webpack/_production.config.js` => `/config/webpack/prod.js`
- `/webpack/_aot.config.js` => Removed; merged to `/config/webpack/prod.js`
- `/webpack/dev-server.config.js` => `/config/webpack/dev-server.js`
- `/webpack/dll.config.js` => `/config/webpack/dll.js`
- `/webpack/test.config.js` => `/config/webpack/test.js`
- `/webpack/main.config.js` => Removed; now directly uses the configs corresponding to the particular script.
- `/webpack/constants.js` => Moved to `/config/webpack/factories` and split into three subfiles:
  - `constants.js` contains webpack configuration entries shared in different configs.
  - `plugins.js` contains factory functions for plugins.
  - `rules.js` contains factory functions for rules.

### example-prod-server
Folder got removed, contents moved to `/scripts`.
- `/example-prod-server/server.js` => `scripts/serve.js`
- `/example-prod-server/proxy.js` => `scripts/util/proxy.js`

### bin, dev
Both folders got removed, their contents (if anymore required) got moved:
- `/bin/compile-translations.js`, `dev/translations.js` => Merged to `scripts/translations.js`
- `/dev/utils.js` => `scripts/util/fileUtils.js`
- `/dev/watch.js` => `scripts/util/watch.js`

### Others
The files below have just been moved, without any further modification except path adoptions.
- `/stylelint.config.js` => `config/stylelint.config.js`
- `src/index.template.html` => `public/index.ejs`; is now an `ejs` template since the HTML version did no longer get processed correctly. This does not have any impact on the syntax used inside before.

# Technical changes
- Phantomjs was replaced by electron as test runner. See `docs/troubleshooting.md` if you face any problems.
- Development, build and test execution are now implemented in custom scripts. See the `scripts` folder for details. Both development and build mode are now using custom formatters for generating the output provided by webpack. Please open an issue if you face any problems or have any suggestions.
- Development and build mode are configurable via config file or CLI. See `docs/dev_configuration.md` and `docs/build_configuration.md`.
- The build mode no longer supports `closure-compiler` as code minifier, since it caused several problems in conjunction with AoT mode, while providing only a minor benefit.
- The different build modes no longer target different output folders by default. Those are configurable now.
- The unit tests are no longer executed in parallel during development, since that mode was quite noisy and caused additional confusion on larger projects, when test bundling takes long. If you still want that behavior, I'd recommend to start them in a different terminal tab; the `test:watch` starts the karma server in watch mode.
- Test execution was added as a pre-push hook to make sure they get executed before the corresponding commit gets published.
- Component templates (i.e. `*.component.html`) are now processed by `html-loader` instead of `raw-loader`. As a result, you might reference assets from those files to get them processed by webpack (e.g. images).
- **Assets**: There is now a suggested structure to deal with assets, either with directly  (i.e. processed by webpack) or indirectly referenced ones.
  - The `public` folder is intended for indirectly referenced assets, i.e. those that are not processed by webpack. The contents of this folder are recursively copied to your defined output folder in build mode except the `index.ejs` template. In development mode, they get served by the dev-server.
  - The `src/app` folder contains assets that are referenced by webpack, e.g. in case they are imported from your code or referenced by templates using relative paths.

# Tasks / Scripts
The task list has been cleared out a lot. All `pre*` tasks have been removed, their intent is now executed by the particular scripts. Below is a list of the changes to all other tasks, in case there was any.

### Scripts now aiming at particular scripts
- `start` => No longer executes a series of tasks or multiple tasks in parallel, but now uses a particular script that takes care of everything required.
- `test` => Now executes the tests once, in non-production mode.
- `build` => Now executes a build with AoT by default. Can be disabled using the `--use-aot=false` flag.
- `build:aot:bo` => Replaced by `build:bo`, AoT is now on by default.
- `prod-server`, `prod-server:aot`, `prod-server:aot:bo` => Replaced by the `serve` script, which picks up you most recent build by default.

### Scripts moved to particular scripts
- `dev-dll:` => Removed, executed in the particular scripts.
- `translations:prod` => Removed, executed in the particular scripts.
- `translations:dev` => Same.

### Scripts removed
The scripts below got removed because they are no longer required, since their work is now bound to the particular scripts.
- `clear`
- `test:dev`
- `dev-bundle`
- `dev-server`
- `dev-tasks`
- `build:aot` => Removed, AoT is now activated default.

The scripts below got removed because we no longer support closure compiler as code minifier.
- `build:cc`
- `build:aot:cc`
- `prod-server:cc`
- `prod-server:aot:cc`

### New scripts
- `test:watch` => Runs the karma test runner in watch mode.
- `test:ci` => Executes unit test including coverage, as mostly used by CI systems.