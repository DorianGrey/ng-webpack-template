# General template structure
We'll only go through the most important files and folders here, so that you can get an idea of how the template is structured and how you might adopt it to your particular requirements.
 
## Files
- **.stylelintrc** contains the configuration used for [stylelint](https://github.com/stylelint/stylelint). We've picked up a useful set of defaults for `.scss` files.
- **karma.conf.js** contains the configuration used for [karma](https://github.com/karma-runner/karma). Note that the particular configuration differs between development and production mode, which is handled by the script itself by evaluating the `NODE_ENV` environment variable.
- **tsconfig.json** and **tsconfig.aot.json** contain the TypeScript configurations for JiT and AoT mode. While reading it, you might recognize that we've enabled a rather strict set of compiler options, like `noImplicitAny`, `noImplicitReturns` and `noImplicitThis`. This might appear extremely restrictive at first, but we've had good experience with this setup. It assists in keeping track and working around several issues, inconsistencies and curious behaviors that especially developers with just a few or even no experience with TypeScript are rather often facing early.
- **tslint.json** contains the configuration for [tslint](https://github.com/palantir/tslint). Once again, a rather strict one, but for the same reasons as we had for the TypeScript configs.

## Folders
- **dev** contains the utility libs used by this template, e.g. for linting the sources and compiling the translations.
- **bin** contains the binary counterpart to these utilities, so that they can be used by `npm` scripts.
- **docs** is obviously the folder containing this documentation.
- **example-dist-server** contains an exemplary production server using [express](http://expressjs.com) and a corresponding proxy config. You might use this as an example, or as basis for setting up a frontend server for your project.
- **src** contains the application source itself.
  - **styles** is intended for all styles that affect the application's style globally.
  - **app** contains the modules used by our application; one folder per module. Folders with a `+` prefix indicate modules that are loaded on demand via routing.
- **webpack** contains the various webpack config files for the different build modes.

## Temporary folders (not tracked via git)
- **.awcache** is used by [awesome-typescript-loader](https://github.com/s-panferov/awesome-typescript-loader) for caching its build output.
- **.tmp** gets created during development. It contains the webpack DLLs generated for vendor and polyfill libraries.
- **dist** gets created by using `yarn run dist` or `yarn run dist-server` and contains the generated bundles, stylesheets and the particular `index.html` file.
- **dist-aot** contains the same as **dist**, but is the destination folder when using AoT (i.e. `yarn run dist:aot` or `yarn run dist-server:aot`). 
- **test-results** contains the output of the `coverage` and `junit` reporters.
- **src/generated** is the output folder of the `translations` tasks and contains a typescript source file exporting all translations that are defined for the applications as a default-exported object with a top-level key for each language.