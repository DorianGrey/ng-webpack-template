import {assign} from "lodash";
import {StoreModule, ActionReducer, combineReducers} from "@ngrx/store";
import {compose} from "@ngrx/core/compose";
import {List} from "immutable";

import {todosReducer, initialTodosState} from "./todos/todos.store";
import {Todo} from "./todos/todo.model";

export interface AppState {
  todos: List<Todo>;
}

export const reducers = {
  todos: todosReducer
};

// Generate a reducer to set the root state in dev mode for HMR
function stateSetter(reducer: ActionReducer<any>): ActionReducer<any> {
  "use strict";
  return function (state, action) {
    if (action.type === "SET_ROOT_STATE") {
      return action.payload;
    }
    return reducer(state, action);
  };
}

const DEV_REDUCERS = [stateSetter];
const developmentReducer = compose(...DEV_REDUCERS, combineReducers)(reducers);
// TODO: Use and eval the ENV variable (via DefinePlugin).

const initialStates = assign({}, initialTodosState);

export const createStoreProvider = (currentState?: any) =>
  StoreModule.provideStore(developmentReducer, assign(currentState || {}, initialStates));