import {Action, ActionReducer} from "@ngrx/store";

export const LAZY_TEST_ACTION_TYPES = {
  INC_SECONDS: "INC_SECONDS"
};

Object.freeze(LAZY_TEST_ACTION_TYPES);

export class LazyTestActionCreator {
  increaseWatchTimeSecond: () => Action = () => {
    return {type: LAZY_TEST_ACTION_TYPES.INC_SECONDS};
  };
}

export const watchTimeReducer: ActionReducer<number> = (state: number, action: Action) => {
  switch (action.type) {
    case LAZY_TEST_ACTION_TYPES.INC_SECONDS:
      return state + 1;
    default:
      return state;
  }
};

export const initialLazyTestState = {
  watchTime: 0
};