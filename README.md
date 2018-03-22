# ng-webpack-template

[![Build Status](https://travis-ci.org/DorianGrey/ng-webpack-template.svg?branch=master)](https://travis-ci.org/DorianGrey/ng-webpack-template)
[![Build status](https://ci.appveyor.com/api/projects/status/rmlgxb0kwrbj0e6u/branch/master?svg=true)](https://ci.appveyor.com/project/DorianGrey/ng-webpack-template/branch/master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This project provides a template for an [angular](https://angular.io/) project setup with [webpack](http://webpack.github.io).
It started as a companion of [ng-jspm-template](https://github.com/flaviait/ng2-jspm-template), with the primary purpose to provide an almost identical codebase and feature set compared to its brother to make it easier to figure out which template fits better to the daily requirements of development with [angular](https://angular.io/).

## Setup

To start using this template, you might either
 - pick the [latest release](https://github.com/DorianGrey/ng-webpack-template/releases/latest)
 - use something like [degit](https://github.com/Rich-Harris/degit) for scaffolding
 - clone the repository directly for the most recent features and updates:

   `git clone https://github.com/DorianGrey/ng-webpack-template.git`  

You need to install a node.js version >= 8.9, since this project uses ES2015 language features, and we only support node versions from the current **active** LTS upwards.
Things might work for earlier versions, but we do not provide any official support for this.

For users of [nvm](https://github.com/creationix/nvm), we're providing a `.nvmrc` file, so that you only need to execute:
```
nvm install
nvm use
```
We strongly recommend to use nvm (or any other node version manager of your choice).

This version currently favors to use [yarn](https://github.com/yarnpkg/yarn) for faster dependency management. To install it, just run
```
npm install -g yarn
```
Alternatively, you might use `npm`, as long as its version is 5.x or higher. There is an engine restriction in this projects `package.json` to enforce this. The primary intent is to get a proper `package-lock.json` as counterpart to `yarn.lock` to lock your dependency versions. Just replace the `yarn` part of the commands listed below with `npm` resp. `npm run` if you decide against `yarn`.

## Project structure
The intended project structure, how to work with it and possibly extend it is documented in the [docs folder](https://github.com/DorianGrey/ng-webpack-template/tree/master/docs).

- [General structure](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/general_structure.md)
- [The application state and how to extend it](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/app_state.md)
- [Development configuration](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/dev_configuration.md)
- [Build configuration](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/build_configuration.md)
- [Integration and usage of the service worker](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/service_worker.md)

## Additional docs
- [Troubleshooting / known issues](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/troubleshooting.md)

## Migration guides
Even if we always attempt to avoid breaking changes, there are a couple of situations where this is not possible. For these cases, corresponding migration guides will be provided. The already existing ones are listed below.
- Update from < 12.0.0 to >= 12.0.0 ([12.0.0 release](https://github.com/DorianGrey/ng-webpack-template/releases/tag/12.0.0)): [Guide](https://github.com/DorianGrey/ng-webpack-template/blob/master/migration/MIGRATION__12_0_0.md)
- Update from < 18.0.0 to >= 18.0.0 ([18.0.0 release](https://github.com/DorianGrey/ng-webpack-template/releases/tag/18.0.0)): [Guide](https://github.com/DorianGrey/ng-webpack-template/blob/master/migration/MIGRATION__18_0_0.md)

## Workflow

### Development

Just run
```
yarn start
```
which will fire up a webpack-dev-server using webpack's DLL feature up-front to speed up everything, and provide HMR functionality. The latter is based on [ngrx/store](https://github.com/ngrx/store).

For configuring you development environment, check out the [development configuration](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/dev_configuration.md) docs.

### Testing

#### E2E
E2E-testing is currently not included in the default setup. This might change in the future, but for the moment you will have to setup tools like [protractor](https://github.com/angular/protractor) or [cypress](https://github.com/cypress-io/cypress) on your own

#### Unit
This project uses [jest](https://facebook.github.io/jest/) for unit testing. It includes both the test runner and framework. If you are not familiar with it yet, just have a look at its [docs](https://facebook.github.io/jest/docs/en/getting-started.html) - should be simple enough. Just note that we're using the `BDD` structure variant with `describe`, `beforeAll`, `beforeEach`, `it` etc. which should be quite familiar in case you have used `jasmine` or `mocha` before.
The setup is based on [jest-preset-angular](https://github.com/thymikee/jest-preset-angular). In case you have to modify it for your particular purpose, you can change the global mocks in `config/jest/jestGlobalMocks.ts`, the test setup `config/jest/testSetup.ts` and `jest` itself via `jest.config.js`. If you are facing any problems, take a look at the [troubleshooting guide](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/troubleshooting.md).

The tasks below are pre-defined for testing.

| Command    | Effect    |
| ---------- | --------- | 
| test       | Starts the test runner in watch mode. Suitable for quick TDD, but not for explicit debugging or coverage reports. |
| test:debug | Starts the test environment in a debug-compatible (i.e. inspectable) mode. Please have a look at the [node inspector docs](https://nodejs.org/en/docs/inspector/) for instructions how to use it. If you are using VSCode, you might use the provided launch task instead of this command.|
| test:ci    | Starts the test runner in a CI optimized mode. Ignores caches and creates a coverage report. |

Generated reports are stored in the `test-results` directory like, containing:
- `junit` contains a xunit compatible report. Compatible with most report tools used by CI systems.
- `coverage` contains coverage reports in `lcov`, `json`, `html` and `cobertura` formats. The reporters in use can be configured in the `jest.config.js` via the `coverageReporters` key.

### Production

Production builds are by default created using:
- [AoT compilation](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html)
- [UglifyJS2](https://github.com/mishoo/UglifyJS2) as code minifier
- [build-optimizer](https://github.com/angular/devkit/tree/master/packages/angular_devkit/build_optimizer) for getting rid of additional dead / non-required code (esp. decorators).
- A service worker for improved PWA capabilities.

Optionally, you might:
- Disable the build optimizer. Though it already received a lot of work and fixes and should thus be production ready, it still has some glitches, so you might want this.
- In case AoT does not work: Disable it.

These options might be suitable for a particular situation while being problematic in another.

The AoT version is using the [@ngtools/webpack plugin](https://github.com/angular/angular-cli/blob/master/packages/webpack/README.md).
Please keep an eye on the list of [issues marked as related to it](https://github.com/angular/angular-cli/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20aot) in case you're facing any errors.

**Beware**: The whole AoT processing currently enforces rather strict rules (see a rather good explanation [here](https://medium.com/@isaacplmann/making-your-angular-2-library-statically-analyzable-for-aot-e1c6f3ebedd5)) on how not only your own code has to be written, but also the code of the libraries you are using. While **I'd strongly recommend** to head this way if it is possible in any way, esp. the latter restriction might screw up this plan.

The tables below will provide a full overview of the relevant commands.
Note that each build tasks will invoke the `test` task (includes linting, generating the translations and executing the unit-tests) **before** the real build.

In addition to the regular build, every production build will also generate a bundle size analyze report in HTML and JSON format (powered by [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer)). It can be found in the `buildStats` dir once the build task completes. Please keep in mind that it will be overwritten in every cycle.

#### Build tasks

The build can be configured in two ways:
- Statically in the `config/build.config.js` file.
- Dynamically by adding options through the command line. Just use `yarn build -- --[your-option]=[your-option-value]`. You might override every entry, while every not provided parameter will fall back to the default. Options are evaluated using [yargs](https://github.com/yargs/yargs).

See the [build configuration documentation](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/build_configuration.md) for details.

The preconfigured tasks are listed below.

| Command            | Effect        |
| ------------------ | ------------- |
| `yarn build`    | Creates a producton bundle, by default in the `build` folder. Utilizes AoT compilation and [build-optimizer](https://github.com/angular/devkit/tree/master/packages/angular_devkit/build_optimizer).|
| `yarn build:no-bo`        | Creates a producton bundle, by default in the `build` folder. Utilizes AoT compilation, but not the build optimizer. |
| `yarn build:no-service-worker`        | Creates a producton bundle, by default in the `build` folder. Utilizes AoT compilation and build optimizer, but does not generate a service worker file. |

#### Exemplary production server

The result of the build process can be served via the `yarn serve` command. Note that if you changed the `outputDir` option, you will have to provide it here as well, since the `serve` script accesses your build configuration.
