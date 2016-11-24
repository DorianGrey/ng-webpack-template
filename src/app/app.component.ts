import {indexOf} from "lodash";
import {Component} from "@angular/core";
import {TranslateService} from "ng2-translate/ng2-translate";
import translations from "../generated/translations";

@Component({
  selector: "app",
  styleUrls: ["./app.component.scss"],
  templateUrl: "./app.component.html"
})
export class App {

  currentLanguage: string;

  private availableLanguages: string[];

  constructor(private translate: TranslateService) {
    this.currentLanguage    = this.translate.currentLang;
    this.availableLanguages = Object.keys(translations);
  }

  rotateLanguage() {
    let idx              = (indexOf(this.availableLanguages, this.currentLanguage) + 1) % this.availableLanguages.length;
    this.currentLanguage = this.availableLanguages[idx];
    this.translate.use(this.currentLanguage);
  }
}