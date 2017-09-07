import { Store } from "@ngrx/store";
import {
  SetInstallationFailedStateAction,
  SetInstalledContentCachedStateAction,
  SetInstalledNewContentStateAction,
  SetNotAvailableStateAction,
  SetNotAvailableDevModeStateAction,
  SetRemovedStateAction,
  SetActiveServiceWorkerFoundStateAction,
  SetUpdatedServiceWorkerFoundStateAction,
  SetNotAvailableDisabledStateAction,
  ServiceWorkerStateSlice
} from "./service-worker.store";

export default function register(store: Store<ServiceWorkerStateSlice>) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(
      process.env.PUBLIC_URL,
      window.location.toString()
    );
    // process.env.PUBLIC_URL needs to be on the same origin as the served web page,
    // otherwise, we cannot proceed.
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener("load", () => {
      // TODO: Need to figure out if it is required to check if the SW exists before actually fetching it.
      if (process.env.USE_SERVICE_WORKER) {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
        registerSW(swUrl, store);
      } else {
        store.dispatch(new SetNotAvailableDisabledStateAction());
      }
    });
  } else {
    store.dispatch(
      process.env.NODE_ENV === "production"
        ? new SetNotAvailableStateAction()
        : new SetNotAvailableDevModeStateAction()
    );
  }
}

function registerSW(swUrl: string, store: Store<ServiceWorkerStateSlice>) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      if (registration.active) {
        store.dispatch(new SetActiveServiceWorkerFoundStateAction());
      }

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        store.dispatch(new SetUpdatedServiceWorkerFoundStateAction());
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              /*
                At this point, the old content will have been purged and
                the updated content will have been added to the cache.
                Good time for a "New content is available - please refresh."
                request.
               */
              store.dispatch(new SetInstalledNewContentStateAction());
            } else {
              /*
                At this point, everything has been pre-cached.
                Good time for a "Content is cached for offline usage." message.
               */
              store.dispatch(new SetInstalledContentCachedStateAction());
            }
          }
        };
      };
    })
    .catch(error => {
      store.dispatch(new SetInstallationFailedStateAction(error));
    });
}

export function unregister(store: Store<ServiceWorkerStateSlice>) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then(registration => registration.unregister())
      .then(() => store.dispatch(new SetRemovedStateAction()));
  }
}
