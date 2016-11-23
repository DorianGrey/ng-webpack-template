import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";

import {AppState} from "../app.store";
import {LazyTestActionCreator} from "./lazy-test.store";

@Injectable()
export class LazyTestService {
  public watchTime: Observable<number>;

  constructor(private store: Store<AppState>,
              private actionCreator: LazyTestActionCreator) {
    this.watchTime = this.store.select(state => state.watchTime);
  }

  updateSeconds() {
    this.store.dispatch(this.actionCreator.increaseWatchTimeSecond());
  }
}