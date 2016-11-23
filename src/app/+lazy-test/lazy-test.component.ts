import {Component, OnDestroy} from "@angular/core";

@Component({
  selector: "lazy-test",
  template: `
    <p>{{ 'lazyTest.text' | translate }}</p>
    <p>{{ 'lazyTest.info' | translate:{value: visitSeconds} }}</p>
  `
})
export class LazyTestComponent implements OnDestroy {
  visitSeconds: number = 0;
  pendingInterval: number;

  constructor() {
    // We're using the "as any" part on the interval because it might clash with the @types/node
    // definition of "setInterval" otherwise.
    this.pendingInterval = setInterval(() => this.visitSeconds++, 1000 as any);
  }

  ngOnDestroy(): void {
    clearInterval(this.pendingInterval);
  }
}