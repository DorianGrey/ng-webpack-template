import {ActionReducer, combineReducers, Action} from "@ngrx/store";
import {compose} from "@ngrx/core/compose";
import {List} from "immutable";

import {todosReducer} from "./todos/todos.store";
import {Todo} from "./todos/todo.model";
import {watchTimeReducer} from "./+lazy-test/lazy-test.store";

export interface AppState {
  todos: List<Todo>;
  watchTime: number;
}

export const reducers = {
  todos: todosReducer,
  watchTime: watchTimeReducer
};

// Generate a reducer to set the root state in dev mode for HMR
function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  "use strict";
  return function (state: any, action: Action) {
    if (action.type === "SET_ROOT_STATE") {
      return action.payload;
    }
    return reducer(state, action);
  };
}

const DEV_REDUCERS                                         = [stateSetter];
const developmentReducer: (state: any, action: any) => any = compose(...DEV_REDUCERS, combineReducers)(reducers);
// TODO: Use and eval the ENV variable (via DefinePlugin) to properly define a production reducer.

export function rootReducer(state: any, action: any): any {
  return developmentReducer(state, action);
}