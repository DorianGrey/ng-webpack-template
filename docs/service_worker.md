# What service workers are...
... well, if you do not know that yet, you should have a look at proper docs, e.g. on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

# The service worker script

The service worker script can be found in `public/service-worker.js`. It utilizes [workboxjs](https://workboxjs.org/) to simplify the service worker behavior configuration. You might want to take a look at its documentation, though it is not essentially required for the basic setup - that will be explained in this document.

Please note that the file name `service-worker.js` is not configurable for the moment - we might change this in a later release.

You might consider it to be somewhat empty for the moment:

```javascript
importScripts("$serviceWorkerLibAnchor");

const workboxSW = new self.WorkboxSW();
workboxSW.precache([]);

workboxSW.router.registerNavigationRoute("index.html", {
  whitelist: [/^(?!\/__).*/]
});
```
However, this script gets modified during the build process in to steps:
- The [workbox webpack plugin](https://workboxjs.org/reference-docs/latest/module-workbox-webpack-plugin.html) updates the content of the array in `precache` array to contain everything in the output directory of your build. This causes the service worker to pick up these contents and cache them, so it can serve them on request. Note that successive requests to these resources will be handled by the service worker once they are cached (i.e. offline first strategy).

 The corresponding glob and the currently selected file extensions are defined in `config/webpack/prod.js` - at the moment, we are using `["**/*.{html,js,css,jpg,eot,svg,woff2,woff,ttf,json}"]`. However, it will ignore the service worker script itself and potentially referenced source maps (using `["**/*.map", "service-worker.js"]`). Note that with its current configuration, the generated precache entries will not contain a revision hash for the webpack output files, since these already contain a hash.
- The special string `$serviceWorkerLibAnchor` will be replaced with the resolved workbox file name, lead by the public path you defined for the build process.

The `workboxSW.router.registerNavigationRoute` statement is used for a proper implementation of history fallback - it redirects every navigation call the service worker has to handle (i.e. those not handled by angular's router) to `index.html`.

In the end, it looks like this:
```javascript
importScripts("/workbox-sw.prod.v2.0.0.js");

const workboxSW = new self.WorkboxSW();
workboxSW.precache([
  {
    "url": "/index.html",
    "revision": "54f2b7e51ac8ef86e47728655fbb1969"
  },
  {
    "url": "manifest.json",
    "revision": "841de84e1a17dd635242ee929cf0c621"
  },
  {
    "url": "/static/css/bundle.3319ab05b67e.css"
  },
  {
    "url": "/static/js/0.chunk.6a9504e0befb.js"
  },
  {
    "url": "/static/js/bundle.31778cf097f6.js"
  },
  {
    "url": "/static/js/manifest.d41d8cd98f00.js"
  },
  {
    "url": "/static/js/vendor.8097a7ff6839.js"
  },
  {
    "url": "/static/media/testbild.b9456e128144.jpg"
  },
  {
    "url": "workbox-sw.prod.v2.0.0.js",
    "revision": "7b6749c71e3ba8b786ce6cb65e248ac8"
  }
]);

workboxSW.router.registerNavigationRoute("index.html", {
  whitelist: [/^(?!\/__).*/]
});
```

## Extending or modifying the workbox plugin configuration
The plugin configuration can be extended or modified to your particular requirements. The documentation for the (potential) parameters can be found in the [inject manifest docs](https://workboxjs.org/reference-docs/latest/module-workbox-build.html#.injectManifest).

## Extending the service worker script
In general, you will only need to modify the service worker script in `public/service-worker.js`. Especially the [routing docs](https://workboxjs.org/reference-docs/latest/module-workbox-routing.html) might be of interest, since they offer options to define strategies on how to handle external requests depending on their URL , e.g. if performed via ajax. You only have to keep in mind that this file contains plain javascript, **not** typescript.

# Integration in the app
The service worker is integrated via the `ServiceWorkerModule` and the corresponding `ServiceWorkerService`. The `ServiceWorkerService` initiates the registration process on initialization, so it is required to inject this service at least once. While the service worker state is published in the application state, the service also offers an observable to subscribe to - a pre-selection of the particular state. The service worker state consists of:
- A value (always)
- A detail for that value (optional, only available on errors)

Potential state values are listed in the `ServiceWorkerStateValue` enum in `service-worker.store.ts`. Check out the code documentation there.

Currently, the `ServiceWorkerService` is injected in the app component, but you might do that whereever you want. I recommend to just leave it there, since it is a central part of the app and reliably executed on startup, so it guarantees to quickly be able to respond to the service worker state changes. The current implementation only reacts to the information about new content available, and performs a window reload in that case.

Please note that the service worker registration process is initiated regardless of development or production mode, or whether the service worker was disabled in the build configuration or is not available at all - these circumstances only affect the tracked state. More precisely, you will receive a state info with value `STATE_NOT_AVAILABLE_DEV_MODE` in dev mode and `STATE_NOT_AVAILABLE_DISABLED` if it was explicitly disabled in the build configuration. `STATE_NOT_AVAILABLE` is set in case the current environment does not support it, e.g. the browser is incapable, or http is used instead of https as protocol.
We have tried to cut the service worker integration footprint off completely in case it is explicitly disabled, but have not found a proper way without sacrificing the store integration and notification stuff. This behaviour might be changed or optimized once we find a way to do so. Until then, if you do not want these remains when disabling the service worker, you will have to remove them on your own:
- Remove the `ServiceWorkerModule` in `app.imports.ts`.
- Remove all injections and usages of the `ServiceWorkerService`.


Even though the registration process is always initiated, that does not means it is executed completely. In dev mode, or when the service worker disabled or unavailable, the registration script (see `service-worker.register.ts` will properly detect the circumstances and set the proper state, so that neither the service worker script nor the linked workbox script will be loaded at all.

# Troubleshooting
In general, the service worker just does its job and won't fail unless something is configured in the wrong way. If you face any reasonable issues, please open an issue in the repository.

You might play a bit with your service worker in your browser's development tools before - e.g. lists it in `Application => Service Workers` and allows a bit of manual control, which is useful when attempting to figure out any problems or their source.