import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "not-found",
  styleUrls: ["./not-found.component.scss"],
  templateUrl: "./not-found.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {}
