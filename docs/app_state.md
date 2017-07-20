# The application state
The application's core state is stored using a store from the [ngrx/store](https://github.com/ngrx/store) library. It's content is described in `src/app.store.ts`, in the interface `AppState`:

    export interface CoreAppState {
      todos: TodoState;
      language: LanguageState;
      router: RouterReducerState;
    }

It is not required to define an interface for describing your application state, but it simplifies type safe injection of the application's store. E.g., in `src/todos/todo.service.ts`, you will see an injection like this:
 
    store: Store<AppState> 

Without defining an explicit interface, it would be required to use `any` here.

To properly work with your application state during runtime, you need to define a set of `reducers` for each of its entries. In our case, this is also defined in `src/app.store.ts`:
  
    export const reducers: ActionReducerMap<CoreAppState> = {
      todos: todosReducer,
      language: languageReducer,
      router: routerReducer
    };

This hash of reducers gets combined to a single root reducer using `StoreModule.forRoot` (see `src/app/app.imports.ts`).
    
You might have recognized the `ActionReducerMap<CoreAppState>` interface. Technically, it's a helper to ensure that the hash contains a reducer for exactly every field of `CoreAppState` - if you don't, the transpiler will comply and crash you build.

Please read the source documentation in `src/app.store.ts` to get more detailed information about the values and structures used in there.
 
# How to extend it
Extending the application's state is easier than it appears - we'll go through this process in this section.

First, you should create a `[component-or-module-name].store.ts` along the component or module file that this part of the application state belongs to or is primarily used by. State parts that do not refer to a particular component or module should be added to the global definitions in `src/app.store.ts`. 

To properly deal with the state itself, you need to define a list of actions that may alter that state. First of all, you need to define some named actions that illustrate the potential modifications. An example from the `todos` part of the store:

    const ACTION_TYPES = {
      ADD_TODO: "ADD_TODO"
    };

To get the most out of types, it is recommended to use classes to represent you actions. The `type` should be turned into a `readonly` field to avoid accidental modification.

    export class AddTodoAction implements Action {
      readonly type = ACTION_TYPES.ADD_TODO;
      constructor(public payload: Todo) {}
    }
Please note that since ngrx v4, the `Action` interface no longer contains a `payload`, so you have to define it yourself as illustrated below. However, it is recommended to stick to this naming convention.

Next, define a type alias with a union of all potential action types to properly type you reducer. Example from `src/app/todos/todos.store.ts`:

    export type TodoActions = AddTodoAction | CompleteTodoAction;

Furthermore, you should define an interface or a type alias describing your state part's type.

    export interface State {
      current: List<Todo>;
      completed: List<Todo>;
    }

This simplifies defining your reducer (later) and composing your part with the others.

Next, you need to define an initial value for your state. This value will be used when your application gets started, before the first dispatch is executed. In the example above, we've used an empty list of `Todo` entries:

    const initialTodoList = List.of<Todo>();
    
For those who argued: This template uses [immutable-js](https://facebook.github.io/immutable-js/), since it simplifies working with immutable data structures. This comes in handy when defining the proper state mutation for states using non-trivial types.

Go ahead with defining a proper `reducer` for your state. A `reducer` receives two parameters:
- The current state for the particular entry.
- The requested action. If you have followed the convention above when defining your actions, it will have some fields:
  - `type` is one of your defined action's name. In the example above, `"ADD_TODO"` would be the only possible value. Take care that you define your initial state as the default value of this parameter to get things to properly work on startup and hot reload.
  - `payload` is an optional value referring to this action. In the example above, this would be a `Todo` instance that should be added to the list of todos. Please keep in mind that you might have to type-cast this field, since you're asserting a union type.

The reducer is responsible for properly evaluating these parameters and - in case it accepts the provided action type - returning a new application state. If you want things to work in a reasonable manner, you should take care of two aspects:
1. **Never** alter the state that is provided here!
2. **Always** return a new object containing your state!

If you want to omit at least one of these aspects... don't tell anyone you've not been warned.

In the example mentioned above, the reducer looks like (make sure to export it as a function to remain AoT conforming):

    export function todosReducer(
      state: State = initialTodoList, action: TodoActions
    ): State {
      switch (action.type) {
        case ACTION_TYPES.ADD_TODO:
          return state.push(action.payload);
        default:
          return state;
    }

As the last step, add your state part to the global `AppState` definition and the corresponding reducer to the global one. Oh, and take care that your reducer and your set of action types is properly exported, to be usable outside of the definition file.

Once you did all this stuff, you are ready to select your new state part from the injected `Store` instance:

    store.select(state => state.todos)

# State extension using feature modules

Since ngrx v4, it is possible to extend the application store during runtime when loading feature modules. Please see
`src/app/+lazy-test/lazy-test.store.ts` and `src/app/+lazy-test/lazy-test.module.ts` for further details and explanations - the steps are almost equivalent to the ones for extending the core state, except that the definition must not be added to the root in `app.store.ts`.