# The application state
The application's globally relevant state is stored using a store from the [ngrx/store](https://github.com/ngrx/store) library. It's content is described in `src/app.store.ts`, in the interface `AppState`:

    export interface AppState {
      todos: List<Todo>;
      watchTime: number;
    }

It is not required to define an interface for describing your application state, but it simplifies type safe injection of the application's store. E.g., in `src/todos/todo.service.ts`, you will see an injection like this:
 
    store: Store<AppState> 

Without defining an explicit interface, it would be required to use `any` here.

To properly work with your application state during runtime, you need to define a set of `reducers` for each of its entries. In our case, this is also defined in `src/app.store.ts`:
  
    const reducers = {
      todos:     todosReducer,
      watchTime: watchTimeReducer
    };

This hash of reducers gets combined to a single root reducer using the `combineReducers` helper function from `ngrx/store`.
    
You might have recognized that the name of the keys used in the reducers object and the interface definition is equivalent. This is *intended*, since it simplifies to understand how an entry of the interface is mapped to its counterpart in the reducers objects. We strongly recommend to keep follow this convention.

Please read the source documentation in `src/app.store.ts` to get more detailed information about the values and structures used in there.
 
# How to extend it
Extending the application's state is easier than it appears - we'll go through this process in this section.

First, you should create a `[component-or-module-name].store.ts` along the component or module file that this part of the application state belongs to or is primarily used by. State parts that do not refer to a particular component or module should be added to the global definitions in `src/app.store.ts`. 

To properly deal with the state itself, you need to define a list of actions that may alter that state. It most cases, it is sufficient to use an enum or a hash with string fields inside. E.g., for the `todos` page, we've use the latter version like:

    export const ACTION_TYPES = {
      ADD_TODO: "ADD_TODO"
    };
    
In case of the hash strategy, don't forget to properly freeze this object to prevent its  accidental modification:

    Object.freeze(ACTION_TYPES);
    
This is not required for (const) enums, since they cannot be modified during runtime. However, this might need some more `.toString()` calls, since the actions dispatched by the stored have to be identified by strings.

Next, you need to define an initial value for your state. This value will be used when your application gets started, before the first dispatch is executed. In the example above, we've used an empty list of `Todo` entries:

    const initialTodoList = List.of<Todo>();
    
For those who argued: This template uses [immutable-js](https://facebook.github.io/immutable-js/), since it simplifies working with immutable data structures. This comes in handy when defining the proper state mutation for states using non-trivial types.

Go ahead with defining a proper `reducer` for your state. A `reducer` receives two parameters:
- The current state for the particular entry.
- The requested action. This parameters contains two fields:
  - `type` is one of your defined actions names. In the example above, `"ADD_TODO"` would be the only possible value. Take care that you define your initial state as the default value of this parameter to get things to properly work on startup and hot reload.
  - `payload` is an optional value referring to this action. In the example above, this would be a `Todo` instance that should be added to the list of todos.

The reducer is responsible for properly evaluating these parameters and - in case it accepts the provided action type - returning a new application state. If you want things to work in a reasonable manner, you should take care of two aspects:
1. **Never** alter the state that is provided here!
2. **Always** return a new object containing your state!

If you want to omit at least one of these aspects... don't tell anyone you've not been warned.

In the example mentioned above, the reducer looks like:

    export const todosReducer: ActionReducer<any> = (state: List<Todo> = initialTodoList, action: Action) => {
      switch (action.type) {
        case ACTION_TYPES.ADD_TODO:
          return state.push(action.payload);
        default:
          return state;
      }
    }; 
 
As the last step, add your state part to the global `AppState` definition and the corresponding reducer to the global one. Oh, and take care that your reducer and your set of action types is properly exported, to be usable outside of the definition file.

Once you did all this stuff, you are ready to select your new state part from the injected `Store` instance:

    store.select(state => state.todos)

# Optional: Use action creators

While exploring the file that we picked the examples from, you might have recognized a so-called `ActionCreator`:

    export class TodoActionCreator {
      add: (todo: Todo) => Action = todo => {
        return {type: ACTION_TYPES.ADD_TODO, payload: todo};
      };
    }
    
First of all, using these constructs is entirely optional. However, it simplifies the process of creating mutation actions for your stated, since it hides the concrete structure of the action that gets dispatched by the store. Also, it adds some expressiveness.

If you decide to use these, don't forget to add them as providers, so that you can properly inject them. Alternatively, since the action creators themselves do not contain any kind of state, you can boil them down to simple helper functions placed in your module.