import { Injectable } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";

import {
  getWatchTime,
  LazyTestStateSlice,
  IncrementSecondsAction
} from "./lazy-test.store";

@Injectable()
export class LazyTestService {
  watchTime: Observable<number>;

  constructor(private store: Store<LazyTestStateSlice>) {
    this.watchTime = this.store.pipe(select(getWatchTime));
  }

  updateSeconds() {
    this.store.dispatch(new IncrementSecondsAction());
  }
}
