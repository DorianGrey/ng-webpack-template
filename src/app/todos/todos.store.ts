import {Action, ActionReducer} from "@ngrx/store";
import {List} from "immutable";
import {Todo} from "./todo.model";

export const ACTION_TYPES = {
  ADD_TODO: "ADD_TODO"
};

Object.freeze(ACTION_TYPES);

export class TodoActionCreator {
  add: (todo: Todo) => Action = todo => {
    return {type: ACTION_TYPES.ADD_TODO, payload: todo};
  };
}

const initialTodoList = List.of<Todo>();

export const todosReducer: ActionReducer<any> = (state: List<Todo> = initialTodoList, action: Action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_TODO:
      return state.push(action.payload);
    default:
      return state;
  }
};
