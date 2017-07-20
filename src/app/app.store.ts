// tslint:disable max-classes-per-file
import {
  ActionReducer,
  Action,
  ActionReducerMap,
  MetaReducer
} from "@ngrx/store";
import {
  routerReducer,
  RouterReducerState,
  RouterStateSerializer
} from "@ngrx/router-store";
import { createSelector } from "@ngrx/store";
/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from "ngrx-store-freeze";

import {
  completedTodos,
  currentTodos,
  todosReducer,
  State as TodoState
} from "./todos/todos.store";

import { languageReducer, State as LanguageState } from "./i18n/language.store";
import { Params, RouterStateSnapshot } from "@angular/router";

/**
 * This interface describes the core "state" of your application,
 * or at least what you need to restore it properly.
 * When you inject a {Store} to any of your structures, it will at least
 * always be a {Store<CoreAppState>} (as long as you follow our convention, obviously).
 * The store might contain more entries, depending on the feature modules you have
 * loaded already.
 * To access a particular part of your state, you might then just call
 * `.select(state => state.{whatever})`. This will return an {Observable<T>},
 * where {T} is the type of the partial state you selected. You might combine these
 * as well.
 */
export interface CoreAppState {
  todos: TodoState;
  language: LanguageState;
  // This entry is NOT part of our own state, but provided by the @ngrx/router-store module.
  router: RouterReducerState;
}

/**
 * These constants are memoized selectors for properly subscribing on specific parts of your state.
 * They come in quite handy in case you're subscribing to the same part of your state multiple times,
 * esp. in case these subscriptions are more complex ones, e.g. when multiple parts get involved.
 * Since these selectors can be combined with the `createSelector` function as well, it's considered
 * good practice to provide these selectors as constants in all places you're defining a part of your
 * application's state.
 *
 * A simple example:
 *    Before:
 *      `store.select(state => state.todos.current)`
 *    After:
 *      `store.select(getCurrentTodos)`
 *
 * This works because the "todos" state provides a selector `currentTodos` to select the `.current`
 * field from itself, and the global level provides a selector to pick up `todos` from the application's
 * state => selector composition.
 */
export const getTodos = (state: CoreAppState) => state.todos;
export const getCurrentTodos = createSelector(getTodos, currentTodos);
export const getCompletedTodos = createSelector(getTodos, completedTodos);

export const getLanguage = (state: CoreAppState) => state.language;
export const getRouterState = (state: CoreAppState) => state.router;

/**
 * These reducers in this object refer to the {CoreAppState} mentioned above.
 * Our conventions - which is also preferred by most projects out there - is:
 * - There should be exactly one reducer per entry in your {CoreAppState}. This optimizes usability and maintainability.
 * - The reducers registered here should be listed with the same key as the corresponding entry in {CoreAppState} has.
 *   This simplifies relation management.
 */
export const reducers: ActionReducerMap<CoreAppState> = {
  todos: todosReducer,
  language: languageReducer,
  // This entry is NOT part of our own state, but provided by the @ngrx/router-store module.
  router: routerReducer
};

export interface CustomRouterStateInfo {
  url: string;
  queryParams: Params;
  params: Params;
}

/**
 * Provide a stripped-down serializer to properly get devtools and store-freeze working properly.
 */
export class CustomRouterStateSerializer
  implements RouterStateSerializer<CustomRouterStateInfo> {
  serialize(routerState: RouterStateSnapshot): CustomRouterStateInfo {
    return {
      url: routerState.url,
      params: routerState.root.params,
      queryParams: routerState.root.queryParams
    };
  }
}

// Generate a reducer to set the root state in dev mode for HMR

/**
 * This action is intended for setting the application's state with a single shot.
 * See below for further details.
 */
class StateSetterAction implements Action {
  readonly type = "SET_ROOT_STATE";

  constructor(public payload: CoreAppState) {}
}

/**
 * This reducer is used to provide the ability to set the "root state" with a single call,
 * i.e. the payload forwarded to this function contains the whole {CoreAppState}.
 * As a so-called "meta-reducer", it only reacts on particular actions and forwards every other
 * to the nested reducer (which might be another meta-reducer).
 * While setting the whole state at once is not useful in general, it is essentially required for proper HMR,
 * which is used in development mode.
 * @param reducer The inner reducer, which will receive the state and action values in case the
 *                outer reducer does not consume the action - i.e. in every case apart from SET_ROOT_STATE.
 * @returns {ActionReducer<any>}
 */
export function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  "use strict";
  return function(state: any, action: StateSetterAction) {
    if (action.type === "SET_ROOT_STATE") {
      return action.payload;
    }
    return reducer(state, action);
  };
}

/**
 * For dev mode, the regular reducers should be used in conjunction with "meta" reducers,
 * in our case `stateSetter` and `storeFreeze`.
 * TODO: `storeFreeze` temporarily disabled, since it causes errors with zone.js.
 * See https://github.com/ngrx/platform/blob/1bbd5bfa1e646eb42a34e8c9d1904f15f9173ed6/docs/store/api.md#meta-reducers
 *
 * The meta-reducers provided in this list get composed from right to left. If the list is empty,
 * no meta-reducer will be generated during runtime.
 */
export const metaReducers: Array<MetaReducer<any, any>> =
  process.env.NODE_ENV !== "production" ? [stateSetter, storeFreeze] : [];
