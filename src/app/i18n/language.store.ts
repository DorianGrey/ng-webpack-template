import {Action, ActionReducer} from "@ngrx/store";

export const LANGUAGE_ACTION_TYPES = {
  SET_LANG: "SET_LANG"
};

Object.freeze(LANGUAGE_ACTION_TYPES);

export class LangActionCreator {
  setLang: (lang: string) => Action = lang => {
    return {
      type:    LANGUAGE_ACTION_TYPES.SET_LANG,
      payload: lang
    };
  };
}

const initialLang = "en";

export const languageReducer: ActionReducer<string> = (state: string = initialLang, action: Action) => {
  switch (action.type) {
    case LANGUAGE_ACTION_TYPES.SET_LANG:
      return action.payload as string;
    default:
      return state;
  }
};