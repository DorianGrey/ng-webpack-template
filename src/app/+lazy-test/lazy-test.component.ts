import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { Observable } from "rxjs";
import { LazyTestService } from "./lazy-test.service";

@Component({
  selector: "lazy-test",
  styleUrls: ["./lazy-test.component.scss"],
  templateUrl: "./lazy-test.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyTestComponent implements OnDestroy {
  watchTime: Observable<number>;
  pendingInterval: number;

  constructor(private lazyTestService: LazyTestService) {
    this.watchTime = lazyTestService.watchTime;
    // We're using the "as any" part on the interval because it might clash with the @types/node
    // definition of "setInterval" otherwise.
    this.pendingInterval = setInterval(
      () => this.lazyTestService.updateSeconds(),
      1000 as any
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.pendingInterval);
  }
}
