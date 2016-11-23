import {Component, OnDestroy} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {LazyTestService} from "./lazy-test.service";

@Component({
  selector: "lazy-test",
  template: `
    <p>{{ 'lazyTest.text' | translate }}</p>
    <p>{{ 'lazyTest.info' | translate:{value: watchTime | async} }}</p>
  `
})
export class LazyTestComponent implements OnDestroy {
  watchTime: Observable<number>;
  pendingInterval: number;

  constructor(private lazyTestService: LazyTestService) {
    this.watchTime = lazyTestService.watchTime;
    // We're using the "as any" part on the interval because it might clash with the @types/node
    // definition of "setInterval" otherwise.
    this.pendingInterval = setInterval(() => this.lazyTestService.updateSeconds(), 1000 as any);
  }

  ngOnDestroy(): void {
    clearInterval(this.pendingInterval);
  }
}