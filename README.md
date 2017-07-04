# ng-webpack-template

[![Build Status](https://travis-ci.org/DorianGrey/ng-webpack-template.svg?branch=master)](https://travis-ci.org/DorianGrey/ng-webpack-template)

This project provides a template for an [angular](https://angular.io/) project setup with [webpack](http://webpack.github.io).
It started as a companion of [ng-jspm-template](https://github.com/flaviait/ng2-jspm-template), with the primary purpose to provide an almost identical codebase and feature set compared to its brother to make it easier to figure out which template fits better to the daily requirements of development with [angular](https://angular.io/).

## Setup

To start using this template, you might either
 - pick the [latest release](https://github.com/DorianGrey/ng-webpack-template/releases/latest)
 - clone the repository directly for the most recent features and updates:
 - git clone https://github.com/DorianGrey/ng-webpack-template.git

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
Alternatively, you might use good old `npm`, if you REALLY want to. If that is the case, just replace the `yarn` part of the commands listed below with `npm`.

## Project structure
The intended project structure, how to work with it and possibly extend it is documented in the [docs folder](https://github.com/DorianGrey/ng-webpack-template/tree/master/docs).

- [General structure](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/general_structure.md)
- [The application state and how to extend it](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/app_state.md)
- [The linters and why they are not tied to the webpack build](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/linters.md)

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

There are currently four ways to create a production build:
- With or without [AoT compilation](https://angular.io/docs/ts/latest/cookbook/aot-compiler.html) (and optionally: [ngo](https://github.com/angular/ngo))
- With [Closure Compiler](https://github.com/google/closure-compiler-npm) or [UglifyJS2](https://github.com/mishoo/UglifyJS2) as code minifier

Each of them might bring up different results, and might be suitable for a particular situation while being problematic in another.

We have added support for using [Closure Compiler](https://github.com/google/closure-compiler-npm) for minification since
- its results are slightly smaller
- there is currently some work going on to be able to take more advantage of its available optimization techniques
Just note that at the moment, the `Advanced` optimization mode is not yet usable.

Using [ngo](https://github.com/angular/ngo) has an even better impact on the vendor bundle's size. However, it is still extremely experimental, so **beware**. Also note that the changes it applies clash with [Closure Compiler](https://github.com/google/closure-compiler-npm), so you cannot use both in conjunction.

The AoT versions are using the [@ngtools/webpack plugin](https://github.com/angular/angular-cli/blob/master/packages/webpack/README.md).

**Beware**: The whole AoT processing currently enforces rather strict rules (see a rather good explanation [here](https://medium.com/@isaacplmann/making-your-angular-2-library-statically-analyzable-for-aot-e1c6f3ebedd5)) on how not only your own code has to be written, but also the code of the libraries you are using. Before you consider using AoT optimization, you will have to check if all your libraries support it. However, **I'd strongly recommend** to head this way if it is possible in any way. You should also keep an eye on the list of [issues marked as related to it](https://github.com/angular/angular-cli/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20aot).

The tables below will provide a full overview of the relevant commands.
Note that each build tasks will invoke the `test` task (includes linting, generating the translations and executing the unit-tests) **before** the real build.

In addition to the regular build, every production build will also generate a bundle size analyze report in HTML and JSON format (powered by [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer)). It can be found in the `buildStats` dir once the build task completes. Please keep in mind that it will be overwritten in every cycle.

#### Build tasks not including the example server

| Command            | Effect        |
| ------------------ | ------------- |
| `yarn build`        | Creates a producton bundle in the `dist` folder. |
| `yarn build:cc`     | Same as above, but uses [Closure Compiler](https://github.com/google/closure-compiler-npm) for minification.|
| `yarn build:aot`    | Creates a producton bundle in the `dist-aot` folder. Utilizes AoT compilation. |
| `yarn build:aot:ngo`    | Creates a producton bundle in the `dist-aot` folder. Utilizes AoT compilation and [ngo](https://github.com/angular/ngo).<br> **Warning**: This should be considered **experimental!**|
| `yarn build:aot:cc` | Same as above `yarn build:aot`, but uses [Closure Compiler](https://github.com/google/closure-compiler-npm) for minification. |

#### Build tasks including the example server

All of these tasks will bring up the exemplary production server (see the `example-prod-server` directory for details), which is available at `http://localhost:9988` after the build completes.

| Command            | Effect        |
| ------------------ | ------------- |
| `yarn prod-server`        | Creates a producton bundle in the `dist` folder and serves its contents afterwards. |
| `yarn prod-server:cc`     | Same as above, but uses [Closure Compiler](https://github.com/google/closure-compiler-npm) for minification.|
| `yarn prod-server:aot`    | Creates a producton bundle in the `dist-aot` folder and serves its contents afterwards. Utilizes AoT compilation. |
| `yarn prod-server:aot:ngo`    | Creates a producton bundle in the `dist-aot` folder and serves its contents afterwards. Utilizes AoT compilation and [ngo](https://github.com/angular/ngo).<br> **Warning**: This should be considered **experimental!**|
| `yarn prod-server:aot:cc` | Same as above `yarn prod-server:aot`, but uses [Closure Compiler](https://github.com/google/closure-compiler-npm) for minification. |
