# Configuring your development environment
This document lists the various options on how to configure your development environment. These options are parsed from CLI using [yargs](https://github.com/yargs/yargs), so you might use different formats (e.g. spinal- vs. camel-case). Please check out their documentation.

## The config options
The available options are listed below. All of them can be changed statically in the config file, or added as CLI arguments.

The build config file can be found in `config/build.config.js`.

  - **outputDir** is used to configure the root directory of the temporarily created files. Defaults to `<rootDir>/.tmp`.
  - **devtool** The source-map type to be used. Is directly forwarded to webpack. Defaults to `inline-source-map`.
  - **isHot**: Determines whether you want to use HMR or not. Defaults to `true`, which offers the best development experience.
  - **publicUrl** The public url for your environment. Sometimes also called "context". E.g. if you app should be available on `https://whatever.example.com/test`, this value should be `test`. Defaults to `""`.
  - **baseHref** The base href for your build. In most cases, this should be `/` followed by whatever you defined for `publicUrl`. This gets included in the generated `index.html` directly. Defaults to `/`.

Options that cannot be overridden:
  - **isDev** Determines development mode.
  - **isWatch** Determines watch mode.
  - **useAot** Determines AoT usage. Always false, since it does not seem to work properly with reload or HMR.

These options are used internally.