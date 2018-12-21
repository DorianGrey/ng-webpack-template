# What service workers are...
... well, if you do not know that yet, you should have a look at proper docs, e.g. on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

# The service worker script

The service worker script can be found in `public/service-worker.js`. It utilizes [workboxjs](https://workboxjs.org/) to simplify the service worker behavior configuration. You might want to take a look at its documentation, though it is not essentially required for the basic setup - that will be explained in this document.

Please note that the file name `service-worker.js` is not configurable for the moment - we might change this in a later release.

The script seems to be somewhat empty for the moment:

```javascript
workbox.precaching.precacheAndRoute(self.__precacheManifest);

workbox.routing.registerNavigationRoute("index.html", {
  whitelist: [/^(?!\/__).*/]
});
```
The `workbox.routing.registerNavigationRoute` statement is used for a proper implementation of history fallback - it redirects every navigation call the service worker has to handle (i.e. those not handled by angular's router) to `index.html`.

During the build process, the [workbox webpack plugin](https://workboxjs.org/reference-docs/latest/module-workbox-webpack-plugin.html) does two things: 
* Generate a so-called `precache-manifest` from `webpack`'s build output that contains the paths for the files to be cached and a particular revision number based on their content
* Inject the required import statements in the provided `service-worker.js` script so that it imports `workbox` and the generated manifest.

Please note that atm., the script references a `workbox` version to import via a CDN. Since `workbox` is used on quite a lot of websites, this is favorable in terms of caching the required scripts. If you favor to host it yourself, you will have to add the following option to the plugin config:
```
importWorkboxFrom: "local"
```

In the end of the build process, the service worker script roughly looks like this:
```javascript
importScripts("/precache-manifest.3821706ddb1cd9ee3dbac1df2b3f219f.js", "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

workbox.precaching.precacheAndRoute(self.__precacheManifest);

workbox.routing.registerNavigationRoute("index.html", {
  whitelist: [/^(?!\/__).*/]
});

```
While the generated manifest (in the example above: `precache-manifest.3821706ddb1cd9ee3dbac1df2b3f219f.js`) contains the information about the files to be cached:
```javascript
self.__precacheManifest = [
  {
    "revision": "874d63009e0d6006bf550787c44030da",
    "url": "/static/media/testbild.874d63009e0d.jpg"
  },
  {
    "revision": "aa493e56ee2f8560ebfd",
    "url": "/static/css/bundle.7fb15ef0f2d8.css"
  },
  {
    "revision": "97e934f7b6e2b4d11021",
    "url": "/static/js/lazy-test.module.97e934f7b6e2.js"
  },
  {
    "revision": "d41d8cd98f00b204e980",
    "url": "/static/js/runtime.d41d8cd98f00.js"
  },
  {
    "revision": "78669f179b20eb0a51b9",
    "url": "/static/css/vendor.24bf1742e376.css"
  },
  {
    "revision": "78669f179b20eb0a51b9",
    "url": "/static/js/vendor.78669f179b20.js"
  },
  {
    "revision": "aa493e56ee2f8560ebfd",
    "url": "/static/js/bundle.aa493e56ee2f.js"
  },
  {
    "revision": "09ff918ade2847455d5856a82f8119dc",
    "url": "/manifest.webmanifest"
  },
  {
    "revision": "ea6b7dfd9ba2e2b019ab6364cda34348",
    "url": "/index.html"
  },
  {
    "revision": "3c1edce38a8d91a157aca60dfc3ca022",
    "url": "/favicon96x96.png"
  },
  {
    "revision": "58dbe14d86976644052b4446c5b8f077",
    "url": "/favicon64x64.png"
  },
  {
    "revision": "f02490f57f87ca2c1167b5e8c4d0bd9e",
    "url": "/favicon48x48.png"
  },
  {
    "revision": "565a8ea92a8e743b5323f6dc29e0146d",
    "url": "/favicon.png"
  }
];
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


Even though the registration process is always initiated, that does not means it is executed completely. In dev mode, or when the service worker disabled or unavailable, the registration script (see `service-worker.register.ts`) will properly detect the circumstances and set the proper state, so that neither the service worker script nor the linked workbox script will be loaded at all.

# Troubleshooting
In general, the service worker just does its job and won't fail unless something is configured in the wrong way. If you face any reasonable issues, please open an issue in the repository.

You might play a bit with your service worker in your browser's development tools before - e.g. in Chrome and its siblings it is listed in `Application => Service Workers` and allows a bit of manual control, which is useful when attempting to figure out any problems or their source.

## Incorrect or incomplete page update when using AoT-only and AoT-with-bo build on the same URL
Recently, I came across some issues in case an URL was used to display content from both AoT und AoT-with-bo builds. If you are switching between builds of different configurations, some curious errors may occur in the browser console which do not seem to make sense, like `C.c is undefined` or `C.c is no a function`. This might also occur in case you are trying to perform a full page reload, considering to fix this error that way. Seems to have to do with the service worker, since the error disappears after manually deregistering it and performing a full page reload once afterwards. A workaround for the moment would be to use different URLs for testing both build versions (different port is sufficient).
