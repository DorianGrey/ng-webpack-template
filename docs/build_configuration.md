# Configuring your build
This document lists the various options on how to configure your build. These options are parsed from CLI using [yargs](https://github.com/yargs/yargs), so you might use different formats (e.g. spinal- vs. camel-case). Please check out their documentation.

## The config options
The available options are listed below. All of them can be changed statically in the config file, or added as CLI arguments.

The build config file can be found in `config/build.config.js`.

  - **outputDir** is used to configure the root directory of your build output. Defaults to `<rootDir>/build`.
  - **statsDir** is used to configure the root directory of the generated build stats. Defaults to `<rootDir>/buildStats`.
  - **disableLongTermCaching** can disable the set of plugins used for long term caching. Defaults to `false`. Note that for production builds, it is not recommended to set this to `true`.
  - **devtool** The source-map type to be used. Is directly forwarded to webpack. Defaults to `source-map`.
  - **useAot** Determines whether AoT mode is used or not. Defaults to `true`.
  - **useBuildOptimizer** Determines whether the build optimizer should be used or not. Since this is still an experimental technology, it defaults to `false`.
  - **publicPath** The public url for your build. Sometimes also called "context". E.g. if you app should be available on `https://whatever.example.com/test`, this value should be `/test`. Defaults to `"/"`.
  - **baseHref** The base href for your build. In most cases, this should be `/`. This gets included in the generated `index.html` directly. Defaults to `/`.
  - **hashDigits** The amount of digits used in the hashed of the generated output. Defaults to `12`.
  - **categorizeAssets** is used to determine if and how your assets are categorized when generating the build information. If you don't want any kind of categorization, just set this to `false`. It's a hash of `categoryName` to `regex to match`. Default value:
    ```
    {
        "Service worker": /(workbox|service-worker).*\.js$/,
        Scripts: /\.js$/,
        Styles: /\.css$/,
        "Source maps": /\.map$/,
        Favicons: /favicon(\d+x\d+)?\.png$/,
        Images: /\.(jpe?g|png|gif|bmp)$/,
        Fonts: /\.(woff2?|eot|ttf|svg)$/
    }
    ```
  - **assetsSizeWarnLimit** is the amount of bytes that a target file might have before a warning about its size is triggered. Defaults to 250*1024 byte, i.e. 250 KB.
  - **potentiallyExtractedChunkSizeLimit** is the upper limit of bytes for the size of `.js` file before it is categorized as the "remain" of a css extraction. Defaults to 512.
  // This gzip level is used heavily, i.e. by nginx, so it makes sense
  // to take it as a reference.
  - **gzipDisplayOpts** is a set of `gzip` options to be used when determining the compressed size of your output. Defaults to `{ level: 6 }`, i.e. compression level 6, which is widely used, e.g. by `nginx`.

Options that cannot be overridden:
  - **isDev** Determines development mode. Always false.
  - **isWatch** Determines watch mode. Always false.

These options are used internally.