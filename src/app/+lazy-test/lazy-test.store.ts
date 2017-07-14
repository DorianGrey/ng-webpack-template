import { Action, ActionReducer } from "@ngrx/store";

export const LAZY_TEST_ACTION_TYPES = {
  INC_SECONDS: "INC_SECONDS"
};

Object.freeze(LAZY_TEST_ACTION_TYPES);

export class LazyTestActionCreator {
  increaseWatchTimeSecond: () => Action = () => {
    return { type: LAZY_TEST_ACTION_TYPES.INC_SECONDS };
  };
}

const initialWatchTime = 0;

export const watchTimeReducer: ActionReducer<number> = (
  state: number = initialWatchTime,
  action: Action
) => {
  switch (action.type) {
    case LAZY_TEST_ACTION_TYPES.INC_SECONDS:
      return state + 1;
    default:
      return state;
  }
};
