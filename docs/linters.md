# TypeScript and SCSS linting

This template includes tasks for linting the scripts (using [TSLint](https://github.com/palantir/tslint)) and stylesheets (using [stylelint](https://github.com/stylelint/stylelint)). You might have recognized that in development, these tasks are executed in parallel with the webpack build, i.e. they are not part of it.
 
Although there are loaders and plugins for properly integrating these linters to the webpack build process, I've favored to stick with separate linting tasks as in the JSPM version of this template. The primary reason to do so is the "history" feature that cannot be implemented using a webpack loader and only partially with a plugin.

## The problem
Using the webpack integration (either via loader or plugin), each target file would be linted as part of the build process, i.e. when the bundle is created for the first time, and on each update. While this seems easier at first glance, it also has a downside: When you have linter errors in multiple files, fixing the errors of one of these files will lead to a message without any error indication on bundle update, although you have not fixed all existing linter errors yet. It's possible to work around this a little bit using plugins, but in most cases, this leads to linting all target files, even if they did not receive any change.

As a result, we're either linting files unnecessarily, or receive incomplete positive linter results. Both is somewhat... unlikely.

## The "history" feature

Both linters task are scanning all target files when they are started. For each file that contains errors, these are stored in an internal cache. When you change one (or more) of the target files, the corresponding linter processes only the changed files. Depending on the linter result, it updates the cache:
 - In case the linters emits an empty error list, the file is deleted from the cache (if it was present before).
 - In case the file is already listed in the cache, the error list is updated.
 - In case the file is not listed in the cache, it is added with its name and the related error list.
 
Once all changed files are linted, the output is created from all files and corresponding error messages listed in the cache. This way, the output will always remind you of errors in files that you did not change (yet) until you fix them. 



