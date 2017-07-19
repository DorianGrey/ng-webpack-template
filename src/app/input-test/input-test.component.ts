import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "input-test",
  styleUrls: ["./input-test.component.scss"],
  templateUrl: "./input-test.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputTestComponent {
  input: string;

  constructor() {
    this.input = "";
  }
}
