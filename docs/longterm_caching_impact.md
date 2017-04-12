# Size impact of long term caching

For production builds, this template uses several plugins to optimize their long-term caching abilities. These have been selected and configured based on the descriptions in the [official guide](https://webpack.js.org/guides/caching/).

Since these strategies include the extraction of a vendor bundle, this ability comes at the expense of the overall assets size. This is primarily caused by the problem that the more advanced tree-shaking and unused code elimination strategies are not usable with this kind of bundle splitting. The tables below will illustrate this difference in detail.

If you do not need or required these abilities in your production builds, you can disable the corresponding plugins by adding `--env.disableLongTermCaching` to your production build command.

## Long term caching - chunk sizes evolved

### Before adding any plugin
| Asset            | Size        |
| ---------------- | ----------- |
|0.chunk.0eed04044fc81a0b56b6.js|3.98 kB |
|bundle.9af66dc4aa5f8427cef7.js|574 kB |
|main.f8f3b06916bb5e145592f5d71309b3fa.css|7.75 kB |
|index.html|510 bytes|

All scripts together end up at a size of **577.98kB**.


### With `HashedModuleIdsPlugin`, extracted `manifest` and `chunk-manifest` and optimized hashing strategy
| Asset            | Size        |
| ---------------- | ----------- |
|0.chunk.f6d889608abb738f2ad9.js|4.08 kB |
|bundle.bfd56e28e478c9f3ef59.js|577 kB |
|chunk-manifest.json|77 bytes|
|manifest.d41d8cd98f00b204e980.js|1.39 kB|
|main.f8f3b06916bb5e145592f5d71309b3fa.css|7.75 kB |
|index.html|595 bytes|

All scripts together end up at a size of **582.47kB**, which is **4.49kB** larger than without any plugins. This is primarily caused by the usage of the `HashedModuleIdsPlugin`.

### With dynamic vendor chunk and inlined `chunk-manifest`
| Asset            | Size        |
| ---------------- | ----------- |
|0.chunk.f6d889608abb738f2ad9.js|4.08 kB|
|vendor.a9f924634e929ffe684c.js|566 kB|
|bundle.a059a041db986079ffb7.js|37.6 kB |
|manifest.d41d8cd98f00b204e980.js|1.39 kB|
|main.f8f3b06916bb5e145592f5d71309b3fa.css|7.75 kB |
|index.html|856 bytes|

All scripts together end up at a size of **609.07kB**, which is **31.09kB** larger than without any of the plugins. As you see, this size increase is primarily caused by using the dynamically extracted vendor chunk.