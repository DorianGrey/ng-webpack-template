import { ChangeDetectionStrategy, Component, OnDestroy } from "@angular/core";
import { interval, Observable, Subscription } from "rxjs";
import { LazyTestService } from "./lazy-test.service";

@Component({
  selector: "lazy-test",
  styleUrls: ["./lazy-test.component.scss"],
  templateUrl: "./lazy-test.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LazyTestComponent implements OnDestroy {
  watchTime: Observable<number>;
  subscription: Subscription;

  constructor(private lazyTestService: LazyTestService) {
    this.watchTime = lazyTestService.watchTime;
    this.subscription = interval(1000).subscribe(() =>
      this.lazyTestService.updateSeconds()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
