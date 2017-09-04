// tslint:disable max-classes-per-file
import { Action } from "@ngrx/store";
import assign from "lodash-es/assign";

export enum ServiceWorkerStateValue {
  // No particular state information available yet.
  STATE_PENDING = "STATE_PENDING",
  // Service worker is not available in general (e.g. not supported / blocked by protocol).
  STATE_NOT_AVAILABLE = "STATE_NOT_AVAILABLE",
  // Service worker is not available due to development mode.
  STATE_NOT_AVAILABLE_DEV_MODE = "STATE_NOT_AVAILABLE_DEV_MODE",
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
  | SetInstalledNewContentStateAction
  | SetInstalledContentCachedStateAction
  | SetRemovedStateAction
  | SetInstallationFailedStateAction;

export interface State {
  value: ServiceWorkerStateValue;
  details: any | null;
}

const initialServiceWorkerState: State = {
  value: ServiceWorkerStateValue.STATE_PENDING,
  details: null
};

export function serviceWorkerStateReducer(
  state: State = initialServiceWorkerState,
  action: ServiceWorkerStateActions
): State {
  switch (action.type) {
    case ServiceWorkerStateValue.STATE_PENDING:
    case ServiceWorkerStateValue.STATE_NOT_AVAILABLE:
    case ServiceWorkerStateValue.STATE_NOT_AVAILABLE_DEV_MODE:
    case ServiceWorkerStateValue.STATE_INSTALLED_NEW_CONTENT_AVAILABLE:
    case ServiceWorkerStateValue.STATE_INSTALLED_CONTENT_CACHED:
    case ServiceWorkerStateValue.STATE_REMOVED:
      return assign({ ...state }, <State>{
        value: action.type,
        details: null
      });
    case ServiceWorkerStateValue.STATE_INSTALLATION_FAILED:
      return assign({ ...state }, <State>{
        value: action.type,
        details: action.payload
      });
    default:
      return state;
  }
}

// tslint:enable max-classes-per-file
