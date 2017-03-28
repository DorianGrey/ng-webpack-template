import {Action, ActionReducer} from "@ngrx/store";
import {List} from "immutable";
import assign from "lodash-es/assign";
import {Todo} from "./todo.model";

export const ACTION_TYPES = {
  ADD_TODO:      "ADD_TODO",
  COMPLETE_TODO: "COMPLETE_TODO"
};

Object.freeze(ACTION_TYPES);

export class TodoActionCreator {
  add: (todo: Todo) => Action = todo => {
    return {type: ACTION_TYPES.ADD_TODO, payload: todo};
  };

  complete: (todo: Todo) => Action = todo => {
    return {type: ACTION_TYPES.COMPLETE_TODO, payload: todo};
  };
}

export interface State {
  current: List<Todo>;
  completed: List<Todo>;
}

const initialTodoList: State = {
  current:   List.of <Todo>(),
  completed: List.of <Todo>({text: "A completed task!", addedTimestamp: new Date(0), completedTimestamp: new Date(0)})
};

export const currentTodos   = (state: State) => state.current;
export const completedTodos = (state: State) => state.completed;

export const todosReducer: ActionReducer<any> = (state: State = initialTodoList, action: Action) => {
  switch (action.type) {
    case ACTION_TYPES.ADD_TODO:
      return assign(
        {...state},
        {current: state.current.push(action.payload)}
      );
    case ACTION_TYPES.COMPLETE_TODO:
      const idx = state.current.findIndex(e => e.addedTimestamp === action.payload.addedTimestamp && e.text === action.payload.text);
      /*
       Only update the lists in case:
       - The completed task is on the current list.
       - The completed task is correctly marked as "done".
       */
      if (idx >= 0 && action.payload.done) {
        return assign(
          {...state},
          <State> {
            current:   state.current.remove(idx),
            completed: state.completed.push(action.payload)
          }
        );
      } else {
        return state;
      }
    default:
      return state;
  }
};
