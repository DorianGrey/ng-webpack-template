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
const LANGUAGE_ACTION_TYPES = {
  SET_LANG: "SET_LANG"
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
export class SetLanguageAction implements Action {
  readonly type = LANGUAGE_ACTION_TYPES.SET_LANG;

  constructor(public payload: string) {}
}

/**
 * Put all of your actions together in a union type to optimize you reducer's accepted
 * action type. It's trivial in this case, but might get more complicated later on.
 *
 * Feel free to add more actions if required.
 */
export type LanguageActions = SetLanguageAction;

/**
 * Export a type alias or interface describing the type of the store-part you're defining
 * here. It's recommended in general to do so for more complex entries, and I recommend
 * it as well for more simple structures to ensure consistency.
 */
export type State = string;

/**
 * The initial state for this reducer. Used in the reducer definition below.
 * Note that it is also possible to define the initial state globally via `StoreModule.forRoot`.
 * It's a matter of personal preference if you prefer that centralized approach or the more
 * localized one used in this template.
 */
const initialLang = "en";

export function languageReducer(
  state: string = initialLang,
  action: LanguageActions
): State {
  switch (action.type) {
    case LANGUAGE_ACTION_TYPES.SET_LANG:
      return action.payload as string;
    default:
      return state;
  }
}
// tslint:enable max-classes-per-file
