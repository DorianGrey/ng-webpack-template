import { ActionReducer, combineReducers, Action } from "@ngrx/store";
import { routerReducer, RouterState } from "@ngrx/router-store";
import { compose } from "@ngrx/core/compose";
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
import { watchTimeReducer } from "./+lazy-test/lazy-test.store";
import { languageReducer } from "./i18n/language.store";
import { createSelector } from "reselect";

/**
 * This interface describes the relevant "state" of your application,
 * or at least what you need to restore it properly.
 * When you inject a {Store} to any of your structures, it will always be a
 * {Store<AppState>} (as long as you follow our convention, obviously).
 * To access a particular part of your state, you might then just call
 * `.select(state => state.{whatever})`. This will return an {Observable<T>},
 * where {T} is the type of the partial state you selected. You might combine these
 * as well.
 */
export interface AppState {
  todos: TodoState;
  watchTime: number;
  language: string;
  // This entry is NOT part of our own state, but provided by the @ngrx/router-store module.
  router: RouterState;
}

// TODO: Should be more documented how this works...
export const getTodos = (state: AppState) => state.todos;
export const getCurrentTodos = createSelector(getTodos, currentTodos);
export const getCompletedTodos = createSelector(getTodos, completedTodos);

export const getWatchTime = (state: AppState) => state.watchTime;
export const getLanguage = (state: AppState) => state.language;
export const getRouterState = (state: AppState) => state.router;

/**
 * These reducers in this object refer to the {AppState} mentioned above.
 * Our conventions - which is also preferred by most projects out there - is:
 * - There should be exactly one reducer per entry in your {AppState}. This optimizes usability and maintainability.
 * - The reducers registered here should be listed with the same key as the corresponding entry in {AppState} has.
 *   This simplifies relation management.
 */
const reducers = {
  todos: todosReducer,
  watchTime: watchTimeReducer,
  language: languageReducer,
  // This entry is NOT part of our own state, but provided by the @ngrx/router-store module.
  router: routerReducer
};

// Generate a reducer to set the root state in dev mode for HMR

/**
 * This reducer is used to provide the ability to set the "root state" with a single call,
 * i.e. the payload forwarded to this function contains the whole {AppState}.
 * While this is not useful in general, it is essentially required for proper HMR, which is used
 * in development mode.
 * It will be composed with the reducers listed above.
 * @param reducer The inner reducer, which will receive the state and action values in case the
 *                outer reducer does not consume the action - i.e. in every case apart from SET_ROOT_STATE.
 * @returns {(state:any, action:Action)=>(any|any)}
 */
function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  "use strict";
  return function(state: any, action: Action) {
    if (action.type === "SET_ROOT_STATE") {
      return action.payload;
    }
    return reducer(state, action);
  };
}

// Feel free to add more reducers for development mode to this list, e.g. https://github.com/ngrx/store-log-monitor.
const DEV_REDUCERS = [stateSetter, storeFreeze];
// This reducer is only used in development mode and is the result of a composition of DEV_REDUCERS and
// the reducers that are related to your {AppState}.
const developmentReducer: ActionReducer<any> = compose(
  ...DEV_REDUCERS,
  combineReducers
)(reducers) as ActionReducer<any>;
// This reducer is only used in production mode and is just a combination of the once your provided for your {AppState}.
const productionReducer: ActionReducer<any> = combineReducers(reducers);

/**
 * Regularly, the "reducer" may a function value. However, due to AoT restrictions,
 * we have to explicitly provide a function here.
 * @param state The current state.
 * @param action The action to evaluate.
 * @returns {any} The result state.
 */
export function rootReducer(state: any, action: any): any {
  // It might seem ineffective to evaluate this statement multiple times.
  // Don't worry: "ENV" is provided by webpack's DefinePlugin, so it is treated as a constant value.
  // Thus, the result of this expression is also constant.
  // As a result, webpack can use it as a condition to drop some parts of the code w.r.t. to the result
  // of this expression.
  if (ENV !== "production") {
    return developmentReducer(state, action);
  } else {
    return productionReducer(state, action);
  }
}
