// tslint:disable max-classes-per-file
import { Action } from "@ngrx/store";
import { List } from "immutable";
import assign from "lodash-es/assign";
import { Todo } from "./todo.model";

/**
 * Define a set of constants that represent the actions that
 * your locally defined reducer can deal with.
 *
 * Note: As long as you are using strongly-typed actions using
 * classes as illustrated in the definitions below, there is
 * no need to export this definition. If you ever want to do so,
 * it is recommended to freeze it using `Object.freeze`.
 */
const ACTION_TYPES = {
  ADD_TODO: "ADD_TODO",
  COMPLETE_TODO: "COMPLETE_TODO"
};

/**
 * Since @ngrx/store v4, the `Action` interface no longer contains a `payload`
 * field. To get the best out of action definitions, it is recommended
 * to use classes for them - this breaking change makes code tend towards
 * this practice.
 * It is considered best practice to override the `type` field with a readonly
 * one, which carries an entry of the definition set on top of this file.
 * Using the name "payload" for the data assigned to this action is a convention
 * which should not be violated.
 *
 * Using these kind of actions is pretty straight forward:
 *
 *     store.dispatch(new YourAction(yourOptionalPayload))
 */

export class AddTodoAction implements Action {
  readonly type = ACTION_TYPES.ADD_TODO;
  constructor(public payload: Todo) {}
}

export class CompleteTodoAction implements Action {
  readonly type = ACTION_TYPES.COMPLETE_TODO;
  constructor(public payload: Todo) {}
}

/**
 * Put all of your actions together in a union type to optimize you reducer's accepted
 * action type.
 *
 * Feel free to add more actions if required.
 */
export type TodoActions = AddTodoAction | CompleteTodoAction;

/**
 * Export a type alias or interface describing the type of the store-part you're defining
 * here. It's recommended in general to do so for more complex entries, and I recommend
 * it as well for more simple structures to ensure consistency.
 */
export interface State {
  current: List<Todo>;
  completed: List<Todo>;
}

/**
 * These selectors are used for composing selection in more complex states.
 *
 * @see app.store.ts for a more detailed explanation.
 */
export const currentTodos = (state: State) => state.current;
export const completedTodos = (state: State) => state.completed;

/**
 * The initial state for this reducer. Used in the reducer definition below.
 * Note that it is also possible to define the initial state globally via `StoreModule.forRoot`.
 * It's a matter of personal preference if you prefer that centralized approach or the more
 * localized one used in this template.
 */
const initialTodoList: State = {
  current: List.of<Todo>(),
  completed: List.of<Todo>({
    text: "A completed task!",
    addedTimestamp: new Date(0),
    completedTimestamp: new Date(0)
  })
};

export function todosReducer(
  state: State = initialTodoList,
  action: TodoActions
): State {
  switch (action.type) {
    case ACTION_TYPES.ADD_TODO:
      return assign(
        { ...state },
        { current: state.current.push(action.payload) }
      );
    case ACTION_TYPES.COMPLETE_TODO:
      const idx = state.current.findIndex(
        e =>
          e.addedTimestamp === action.payload.addedTimestamp &&
          e.text === action.payload.text
      );
      /*
       Only update the lists in case:
       - The completed task is on the current list.
       - The completed task is correctly marked as "done".
       */
      if (idx >= 0 && action.payload.done) {
        return assign(
          { ...state },
          <State>{
            current: state.current.remove(idx),
            completed: state.completed.push(action.payload)
          }
        );
      } else {
        return state;
      }
    default:
      return state;
  }
}
// tslint:enable max-classes-per-file
