Release 20 contained another huge amount of major updates, changes and library exchanges. The guides listed below aim to help migrating your project as much as possible.

Somewhat sorry that this list is quite long again, but I suppose the technical advantages are worth the work.

# Recommended node version updated to 10.14
As already announced in the README, I'm always aiming to support the most recent `node` LTS. Thus, the version recommended by the provided `.nvmrc` was updated to 10.14. CI still covers 8.x as well, though - yet I strongly recommend to update your environment to use the more recent version.

# Migration of `webpack-serve` back to `webpack-dev-server`
It seems that my migration to `webpack-serve` in version 19 was a bit ... premature. When I scheduled this migration, it seemed that `webpack-dev-server` gets deprecated, and `webpack-serve` being its successor. Now, it seems the circumstances went vice versa. As a result, I've decided to revert the migration. If you've used a version < 19 before, you only have you configuration from that one - it's a direct revert. The functionality of the server used for development and the one for the production preview are equivalent to the 18.x versions again.

# Migration of `lint` functionality
The lint functionality was extracted to a different task `lint` that is executed automatically via a pre-commit hook. It can be executed manually as well.
There are a couple of reasons for this change, but the two most important:
* Most developers are using an IDE or editor that is already capable of providing lint functionality when editing files. As a result, doing the same in the dev task seems somewhat duplicated, and uses additional resources without providing a huge benefit.
* The tasks integrated in the `webpack` process were not capable of using the auto-fix functionalities of `tslint` and `stylelint`, which simplify fixing a lot of errors.

# `image-webpack-loader` was removed
The `image-webpack-loader` was removed from the default setup. This loader has a couple of transitive dependencies relying on particular versions of native libraries that are not available in several environments, or only in an incompatible version. That's why I decided to remove it from the default setup. Feel free to re-add this functionality in case you see a benefit for your project.

# `lodash-es` was removed
Simple stuff here: I recognized that the default setup only uses a single functionality which can be replaced by a typescript-native one. This simplifies the list of dependencies of the project by quite a margin, since it also allows to remove the `babel` transform required for this library from the `jest` configuration.
If your project relies on that library, it shouldn't be a problem to bring it back, just keep in mind that the `jest` configuration has to include the `babel` transformation for it as well.

# Replacing `webpack-merge` with `webpack-chain` to build the webpack configuration
This is the largest change in the release.

Building the config correctly always has been a complex task, since it depends on both the selected build mode and the provided build options. While `webpack-merge` was very helpful to merge config fragments, the result was still a bit messy and hard to read.

As a result, I've searched for alternatives, and found something more like a builder for `webpack` configurations - [webpack-chain](https://github.com/neutrinojs/webpack-chain).
While the resulting configuration chain is somewhat longer than before, it is way easier to read and follow.

Unfortuneately, there is no "direct" migration guide between the two ways of providing a `webpack` configuration. If you have changed the configuration, you will have to apply those changes in `config/webpack/config.js` resp. `config/webpack/dll.js` (only for the dev mode's DLLs). The [getting started guide](https://github.com/neutrinojs/webpack-chain/tree/v4#getting-started) of `webpack-chain` should help you translating your changes to the new API. It is quite intuitive once getting in touch with it, thus it shouldn't be that problematic. However, feel free to open an issue if it is. 

Just to note: The new way of writing a configuration also allows that you separate your changes from the default setup way better than before, since the builder allows you to literally change **EVERY** aspect before it generates the configuration itself. So it is possible to a some kind of "customizing" block just below the default setup, apply every changes to want and go ahead.

Additionally, there is a new task: `inspect`. This one allows you to generate a preview of the generated `webpack` configuration and might be helpful if you're not sure everything was configured correctly. Details about this task are already listed in the README.

# Angular 7
Version 20 includes angular v7, even though it does not yet included the new `ivy` compiler (sadly). Following the [official update guide](https://update.angular.io/) should cover most of your cases.

# ngrx 7
Along with angular v7 comes another major update of the `ngrx` collection, also to v7. It includes a couple of breaking changes that, while not affecting this template, might affect your project. Most of them are related to the generated store events. Details can be found in the project's [changelog](https://github.com/ngrx/platform/blob/master/CHANGELOG.md) - all breaking changes are listed in the section for `7.0.0-beta.0`.