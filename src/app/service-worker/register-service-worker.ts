import { Subject } from "rxjs/Subject";

export default function register(callback: Subject<ServiceWorker | null>) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(
      process.env.PUBLIC_PATH,
      window.location.toString()
    );
    // process.env.PUBLIC_PATH needs to be on the same origin as the served web page,
    // otherwise, we cannot proceed.
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_PATH}/service-worker.js`;
      // TODO: Need to figure out if it is required to check if the SW exists before actually fetching it.
      registerSW(swUrl, callback);
    });
  }
}

function registerSW(swUrl: string, callback: Subject<ServiceWorker | null>) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            /*
              The receiver has to match the result:
              - If it is null, everything has been precached. It should display
                a message like "content is cached for offline usage".
              - Otherwise, it should display something like "New content is available"
                and ask the user to perform a refresh. It might interact with the
                service-worker, but that to keep in mind that it is volatile, i.e.
                it'll be replaced once the user confirms the reload.
             */
            callback.next(navigator.serviceWorker.controller);
          }
        };
      };
    })
    .catch(error => callback.error(error));
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(registration =>
      registration.unregister()
    );
  }
}
