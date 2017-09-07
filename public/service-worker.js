importScripts("$serviceWorkerLibAnchor");

const workboxSW = new self.WorkboxSW();
workboxSW.precache([]);

workboxSW.router.registerNavigationRoute("index.html", {
  whitelist: [/^(?!\/__).*/]
});