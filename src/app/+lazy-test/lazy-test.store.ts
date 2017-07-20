// tslint:disable max-classes-per-file
import { Action } from "@ngrx/store";

/**
 * Define a set of constants that represent the actions that
 * your locally defined reducer can deal with.
 *
 * Note: As long as you are using strongly-typed actions using
 * classes as illustrated in the definitions below, there is
 * no need to export this definition. If you ever want to do so,
 * it is recommended to freeze it using `Object.freeze`.
 */
const LAZY_TEST_ACTION_TYPES = {
  INC_SECONDS: "INC_SECONDS"
};

/**
 * Since @ngrx/store v4, the `Action` interface no longer contains a `payload`
 * field. To get the best out of action definitions, it is recommended
 * to use classes for them - this breaking change makes code tend towards
 * this practice.
 * It is considered best practice to override the `type` field with a readonly
 * one, which carries an entry of the definition set on top of this file.
 * If you want add a field containing your payload, just use "payload" for
 * conventionally naming it.
 *
 * Using these kind of actions is pretty straight forward:
 *
 *     store.dispatch(new YourAction(yourOptionalPayload))
 */
export class IncrementSecondsAction implements Action {
  readonly type = LAZY_TEST_ACTION_TYPES.INC_SECONDS;
}

/**
 * Put all of your actions together in a union type to optimize you reducer's accepted
 * action type. It's trivial in this case, but might get more complicated later on.
 *
 * Feel free to add more actions if required.
 */
export type LazyTestActions = IncrementSecondsAction;

/**
 * Export a type alias or interface describing the type of the store-part you're defining
 * here. It's recommended in general to do so for more complex entries, and I recommend
 * it as well for more simple structures to ensure consistency.
 */
export type State = number;

/**
 * This file defines the utility required for a store entry added by a feature module.
 * The name of this feature has to be provided as a string constant, which will turn
 * into the name of the store entry.
 * Names like this should be defined in the definition of the store part, so that anyone
 * accessing it from external can just pick up the constant and has no need to duplicate
 * this value.
 */
export const LAZY_TEST_FEATURE_NAME = "watchTime";

/**
 * The slice of the application state defined by this module.
 * One this module got loaded, the fields defined by it will
 * be added to the application's store, i.e. the resulting
 * state is of type {CoreAppState & LazyTestStateSlice}.
 *
 * Keep in mind that the name defined here has to match the content of the constant
 * above - otherwise, this value won't be found during runtime.
 */
export interface LazyTestStateSlice {
  watchTime: State;
}

/**
 * A pre-defined selector for retrieving the `watchTime` from the application's state.
 */
export const getWatchTime = (state: LazyTestStateSlice) => state.watchTime;

/**
 * The initial state for this reducer. Used in the reducer definition below.
 * Note that it is also possible to define the initial state globally via `StoreModule.forRoot`.
 * It's a matter of personal preference if you prefer that centralized approach or the more
 * localized one used in this template.
 */
const initialWatchTime = 0;

export function watchTimeReducer(
  state: number = initialWatchTime,
  action: LazyTestActions
): State {
  switch (action.type) {
    case LAZY_TEST_ACTION_TYPES.INC_SECONDS:
      return state + 1;
    default:
      return state;
  }
}
// tslint:enable max-classes-per-file
