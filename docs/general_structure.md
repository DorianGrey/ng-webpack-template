# General template structure
We'll only go through the most important files and folders here, so that you can get an idea of how the template is structured and how you might adopt it to your particular requirements.
 
## Files (top directory)
- **stylelint.config.js** contains the configuration used for [stylelint](https://github.com/stylelint/stylelint). We've picked up a useful set of defaults for `.scss` files.
- **jest.config.js** contains the configuration used for [jest](https://jestjs.io/), the unit test runner in this project.
- **postcss.config.js** contains the configuration used for [postcss](https://postcss.org/).
- **tsconfig.json** and **tsconfig.aot.json** contain the TypeScript configurations for JiT and AoT mode. While reading it, you might recognize that we've enabled a rather strict set of compiler options, like `noImplicitAny`, `noImplicitReturns` and `noImplicitThis`. This might appear extremely restrictive at first, but we've had good experience with this setup. It assists in keeping track and working around several issues, inconsistencies and curious behaviors that especially developers with just a few or even no experience with TypeScript are rather often facing early.
- **tsconfig.spec.json** contains the test mode configuration for TypeScript.
- **tslint.json** contains the configuration for [tslint](https://github.com/palantir/tslint). Once again, a rather strict one, but for the same reasons as we had for the TypeScript configs.
- **.babel.rc** is only used in test mode atm. to properly transpile some of the dependencies involved - or at least the `import`/`export` statements. For dev and build, this is handled by `webpack`. 

## Folders
- **config** contains general configuration files for the build different build modes.
  - **webpack** contains the files involved in the `webpack` configuration.
  - **jest** contains the files invovled in setting up `jest` in test mode.
- **docs** is obviously the folder containing this documentation.
- **public** contains files that are dynamically referenced, i.e. the references are not created or updated via webpack. Apart from the `index.ejs`, the contents of this folder are copied recursively to your build directory.
  - **manifest.json** contains your app's manifest definition, including a name and favicons in different resolutions. Mostly used by mobile browsers, but can be used by desktop ones as well.
- **src** contains the application source itself.
  - **styles** is intended for all styles that affect the application's style globally.
  - **app** contains the modules used by our application; one folder per module. Folders with a `+` prefix indicate modules that are loaded on demand via routing.
  - **assets** is intended for assets that are referenced directly from your app, i.e. the links to them are created and adjusted by webpack. They are added to the build directory automatically, including particular hashes.
- **scripts** contains the various scripts for starting the dev mode, building an app or testing it.
  - **test.js** is used for executing unit tests.
  - **build.js** is used for building your app.
  - **start.js** is used for starting the development environment.
  - **serve.js** starts the production mode preview server, using the latest build directory.
  - **translations.js** is the script used for generating translations from the provided `.yml` files, both one-time and in watch mode.
  - **inspect.js** is used for inspecting the built `webpack` config for the various modes and config options.
  - **util/** contains various utility scripts


## Temporary folders (not tracked via git)
- **.tmp** gets created during development. It contains the webpack DLLs generated for vendor and polyfill libraries.
- **build** is the default build output folder and gets created by using one of the build commands, e.g. `yarn build`  and contains the generated bundles and stylesheets, referenced assets and the particular `index.html` file.
- **buildStats** is the default output folder for the build statistics about your most recent build.
- **test-results** contains the output of the `coverage` and `junit` reporters.
- **src/generated** is the output folder of the `translations` script and contains a typescript source file exporting all translations that are defined for the applications as a default-exported object with a top-level key for each language.