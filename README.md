# ng2-webpack-template

[![Build Status](https://travis-ci.org/DorianGrey/ng2-webpack-template.svg?branch=master)](https://travis-ci.org/DorianGrey/ng2-webpack-template)

This project provides a template for an [angular 2](https://angular.io/) project setup with [webpack](http://webpack.github.io).
Its mainly considered to be the "evil brother" of [ng2-jspm-template](https://github.com/flaviait/ng2-jspm-template), with the primary purpose to provide an almost identical codebase and feature set compared to its brother. The goal will be to use projects to compare the two ways of setting up a project for angular 2 and get a better idea of which of them may be the better one under particular circumstances. Detailed comparison will follow up once this clone is feature-complete.

## Setup

Since there is no release (yet), you'll have to clone this repo:

    git clone https://github.com/DorianGrey/ng2-webpack-template.git

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
Alternatively, you might use good old `npm`, if you REALLY want to.

## Project structure

-- TODO --

## Workflow

### Development

Just run
```
npm start
```
which will fire up a webpack-dev-server using webpack's DLL feature up-front to speed up everything, and provide HMR functionality. The latter is based on [ngrx/store](https://github.com/ngrx/store).


### Production

Just run
```
npm run dist
```
which will create a production build in the `dist` folder.

# TODOs

- ~~Add the linters back into development and production mode~~.
- Properly configure Travis CI.
- Add more docs to the various webpack configs and their `constants` file.
- Add more docs to the code itself, esp. the state maintenance via [ngrx/store](https://github.com/ngrx/store).
- ~~Set up a minimal production server~~.
- Drop unused code, scripts and dependencies.
- Add a lazy loading example for effort comparison with https://github.com/flaviait/ng2-jspm-template/pull/38 .