import {Component} from "@angular/core";

@Component({
  selector:  "input-test",
  styleUrls: ["./inputTest.component.scss"],
  template:  `
    <div>
      <h3>{{'inputTest.heading' | translate}}</h3>
      <div [innerHTML]="'inputTest.display' | translate:{value: input}"></div>
      <input type="text" [(ngModel)]="input" />
    </div>
  `
})
export class InputTestComponent {
  input: string;

  constructor() {
    this.input = "";
  }
}