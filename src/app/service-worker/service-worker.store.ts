// tslint:disable max-classes-per-file
import { Action } from "@ngrx/store";

export enum ServiceWorkerStateValue {
  // No particular state information available yet.
  STATE_PENDING = "STATE_PENDING",
  // Service worker is not available in general (e.g. not supported / blocked by protocol).
  STATE_NOT_AVAILABLE = "STATE_NOT_AVAILABLE",
  // Service worker is not available due to development mode.
  STATE_NOT_AVAILABLE_DEV_MODE = "STATE_NOT_AVAILABLE_DEV_MODE",
  // Service worker is not available since it was disabled for build.
  STATE_NOT_AVAILABLE_DISABLED = "STATE_NOT_AVAILABLE_DISABLED",
  // An active service worker was found. It is not guaranteed that a new version will occur afterwards.
  STATE_ACTIVE_SERVICE_WORKER_FOUND = "STATE_ACTIVE_SERVICE_WORKER_FOUND",
  // An updated service worker (version) was found and is now installing.
  STATE_SERVICE_WORKER_UPDATE_FOUND_INSTALL_PENDING = "STATE_SERVICE_WORKER_UPDATE_FOUND_INSTALL_PENDING",
  // Service worker has been installed/upgraded, new content is available.
  STATE_INSTALLED_NEW_CONTENT_AVAILABLE = "STATE_INSTALLED_NEW_CONTENT_AVAILABLE",
  // Service worker has been installed, content is cached for offline usage.
  STATE_INSTALLED_CONTENT_CACHED = "STATE_INSTALLED_CONTENT_CACHED",
  // Service worker was removed manually by the application.
  STATE_REMOVED = "STATE_REMOVED",
  // Service worker could not be installed to due technical reasons. Error is attached
  // to the action.
  STATE_INSTALLATION_FAILED = "STATE_INSTALLATION_FAILED"
}

export class SetPendingStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_PENDING;
}

export class SetNotAvailableStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_NOT_AVAILABLE;
}

export class SetNotAvailableDevModeStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_NOT_AVAILABLE_DEV_MODE;
}

export class SetNotAvailableDisabledStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_NOT_AVAILABLE_DISABLED;
}

export class SetActiveServiceWorkerFoundStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_ACTIVE_SERVICE_WORKER_FOUND;
}

export class SetUpdatedServiceWorkerFoundStateAction implements Action {
  readonly type =
    ServiceWorkerStateValue.STATE_SERVICE_WORKER_UPDATE_FOUND_INSTALL_PENDING;
}

export class SetInstalledNewContentStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_INSTALLED_NEW_CONTENT_AVAILABLE;
}

export class SetInstalledContentCachedStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_INSTALLED_CONTENT_CACHED;
}

export class SetRemovedStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_REMOVED;
}

export class SetInstallationFailedStateAction implements Action {
  readonly type = ServiceWorkerStateValue.STATE_INSTALLATION_FAILED;
  constructor(public payload: any) {}
}

export type ServiceWorkerStateActions =
  | SetPendingStateAction
  | SetNotAvailableStateAction
  | SetNotAvailableDevModeStateAction
  | SetNotAvailableDisabledStateAction
  | SetActiveServiceWorkerFoundStateAction
  | SetUpdatedServiceWorkerFoundStateAction
  | SetInstalledNewContentStateAction
  | SetInstalledContentCachedStateAction
  | SetRemovedStateAction
  | SetInstallationFailedStateAction;

export interface State {
  value: ServiceWorkerStateValue;
  details: any | null;
}

export const SERVICE_WORKER_FEATURE_NAME = "serviceWorkerInfo";
export interface ServiceWorkerStateSlice {
  serviceWorkerInfo: State;
}

const initialServiceWorkerState: State = {
  value: ServiceWorkerStateValue.STATE_PENDING,
  details: null
};

export const getServiceWorkerInfo = (state: ServiceWorkerStateSlice) =>
  state.serviceWorkerInfo;

export function serviceWorkerStateReducer(
  state: State = initialServiceWorkerState,
  action: ServiceWorkerStateActions
): State {
  switch (action.type) {
    case ServiceWorkerStateValue.STATE_PENDING:
    case ServiceWorkerStateValue.STATE_NOT_AVAILABLE:
    case ServiceWorkerStateValue.STATE_NOT_AVAILABLE_DEV_MODE:
    case ServiceWorkerStateValue.STATE_NOT_AVAILABLE_DISABLED:
    case ServiceWorkerStateValue.STATE_ACTIVE_SERVICE_WORKER_FOUND:
    case ServiceWorkerStateValue.STATE_SERVICE_WORKER_UPDATE_FOUND_INSTALL_PENDING:
    case ServiceWorkerStateValue.STATE_INSTALLED_NEW_CONTENT_AVAILABLE:
    case ServiceWorkerStateValue.STATE_INSTALLED_CONTENT_CACHED:
    case ServiceWorkerStateValue.STATE_REMOVED:
      return {
        ...state,
        value: action.type,
        details: null
      };
    case ServiceWorkerStateValue.STATE_INSTALLATION_FAILED:
      return {
        ...state,
        value: action.type,
        details: action.payload
      };
    default:
      return state;
  }
}

// tslint:enable max-classes-per-file
