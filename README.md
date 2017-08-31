# ng-webpack-template

[![Build Status](https://travis-ci.org/DorianGrey/ng-webpack-template.svg?branch=master)](https://travis-ci.org/DorianGrey/ng-webpack-template)
[![Build status](https://ci.appveyor.com/api/projects/status/rmlgxb0kwrbj0e6u/branch/master?svg=true)](https://ci.appveyor.com/project/DorianGrey/ng-webpack-template/branch/master)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

This project provides a template for an [angular](https://angular.io/) project setup with [webpack](http://webpack.github.io).
It started as a companion of [ng-jspm-template](https://github.com/flaviait/ng2-jspm-template), with the primary purpose to provide an almost identical codebase and feature set compared to its brother to make it easier to figure out which template fits better to the daily requirements of development with [angular](https://angular.io/).

## Setup

To start using this template, you might either
 - pick the [latest release](https://github.com/DorianGrey/ng-webpack-template/releases/latest)
 - clone the repository directly for the most recent features and updates:

   `git clone https://github.com/DorianGrey/ng-webpack-template.git`

You need to install a node.js version >= 6.9, since this project uses ES2015 language features, and we only support node versions from the most recent LTS upwards.
Things might work from 4.x upwards, but we do not provide any official support for this.

For users of [nvm](https://github.com/creationix/nvm), we're providing a `.nvmrc` file, so that you only need to execute:
```
nvm install
nvm use
```
We strongly recommend to use nvm (or any other node version manager of your choice).

The version favors to use [yarn](https://github.com/yarnpkg/yarn) for faster and more robust dependency management. To install it, just run
```
npm install -g yarn
```
Alternatively, you might use good old `npm`, if you REALLY want to. If that is the case, I recommend to use a version >= 5.x to get a proper `package-lock.json`. Just replace the `yarn` part of the commands listed below with `npm`.

## Project structure
The intended project structure, how to work with it and possibly extend it is documented in the [docs folder](https://github.com/DorianGrey/ng-webpack-template/tree/master/docs).

- [General structure](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/general_structure.md)
- [The application state and how to extend it](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/app_state.md)

## Additional docs
- [The impact of using long term caching strategies on your assets size](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/longterm_caching_impact.md)

## Workflow

### Development

Just run
```
yarn start
```
which will fire up a webpack-dev-server using webpack's DLL feature up-front to speed up everything, and provide HMR functionality. The latter is based on [ngrx/store](https://github.com/ngrx/store).


### Production

Production builds are by default created using:
- [AoT compilation](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html)
- [UglifyJS2](https://github.com/mishoo/UglifyJS2) as code minifier

Optionally, you might:
- Optimize further using [build-optimizer](https://github.com/angular/devkit/tree/master/packages/angular_devkit/build_optimizer). However, it is still extremely experimental, so **beware**.
- In case AoT does not work: Disable it.

The latter options might be suitable for a particular situation while being problematic in another.

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


The preconfigured tasks are listed below.

| Command            | Effect        |
| ------------------ | ------------- |
| `yarn build`        | Creates a producton bundle, by default in the `build` folder. Utilizes AoT compilation. |
| `yarn build:bo`    | Creates a producton bundle, by default in the `build` folder. Utilizes AoT compilation and [build-optimizer](https://github.com/angular/devkit/tree/master/packages/angular_devkit/build_optimizer).<br> **Warning**: This should be considered **experimental!**|

#### Exemplary production server

The result of the build process can be served via the `yarn serve` command. Note that if you changed the `outputDir` option, you will have to provide it here as well, since the `serve` script accesses your build configuration.