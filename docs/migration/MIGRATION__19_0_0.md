Release 19 contained a huge amount of major updates, changes and library exchanges. The guides listed below aim to help migrating your project as much as possible.

See [the stats comparison table](https://github.com/DorianGrey/ng-webpack-template/blob/master/docs/webpack-4-upgrade-build-sizes.md) to see how `webpack` V4 and all other updates affected the build output.

# Migration of `angular` to V6
Following the [official update guide](https://update.angular.io/) should cover most of your cases.

# Migration of `rxjs` to V6
Just follow the [official migration guide](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/v6/migration.md) - it is very detailed and should explain everything you might need.

# Migration of `webpack` to V4
Unluckily, there isn't any "official" guide for this. You'll have to read the new [configuration](https://webpack.js.org/configuration/) docs carefully, compare them to your own setup and figure out what has to be changed in which way. I'm sorry that I can't provide more information on how to achieve this, but `webpack` is a bit too complex to cover all of this on my own.

# Migration of `webpack-dev-server` to `webpack-serve`
Since `webpack-dev-server` [switched to maintenance mode](https://github.com/webpack/webpack-dev-server#project-in-maintenance) after receiving `webpack` v4 was added, I decided to check out the listed alternative, [webpack-serve](https://github.com/webpack-contrib/webpack-serve). It's quite likely, somewhat faster and much smaller. And it uses [koa](https://koajs.com/) instead of [express](https://github.com/expressjs/express) under the hood. The only two downsides I was able to figure out were:
- It only works with browser that have native websocket support. To be honest - if your browser does not support this yet, it should not be used any longer in general, considering how long websockets have been part of the standard already. See: https://caniuse.com/#feat=websockets
- It has some glitches when trying to configure it to be hosted on `0.0.0.0` as the previous server while keeping HMR working. I'm not sure about the details, but there are some documentation parts for `webpack-serve` and `webpack-hot-client` (which is also used by `webpack-dev-server`) indicating that it's a better idea to not do this anyway. As a result, the `start` task only provides a server accessible from `localhost` for now. If you need to access your dev server via its local IP, you may just use the `start:local` task, which changes the dev server's IP binding.

There is no "real" migration guide - the configurations are quite similar and thus should not make any problems. See the `webpack-serve` configuration guide: https://github.com/webpack-contrib/webpack-serve#webpack-serve-config

**Note:** The `serve` for previewing your production build was updated to use `koa` as well to avoid additional depenencies on `express`. It's migration should be straight-forward as well, since the features in use are not that different for these two frameworks.


# Migration of custom logger to `signale`
I have decided to put my own logging implementation aside in favor of [signale](https://github.com/klauscfhq/signale), an extremely configurable logger with an optional interactive mode. All loggers in use are configured in `config/logger.js`.

 If you did not use the previous logging implementation in a custom position, you should not face any issues when trying to update. Otherwise, I recommend to use the new logger and get familiar with its API, which is roughly equivalent to the previous one, except that you don't have to provide a line break manually.

 The guides for [custom loggers](https://github.com/klauscfhq/signale#custom-loggers) and [configuration in general](https://github.com/klauscfhq/signale#configuration) should be useful when trying to set up a new logger or configure the current ones.