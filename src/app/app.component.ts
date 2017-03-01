import indexOf from "lodash-es/indexOf";
import {Component} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

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
    this.availableLanguages = this.translate.getLangs();
  }

  rotateLanguage() {
    let idx              = (indexOf(this.availableLanguages, this.currentLanguage) + 1) % this.availableLanguages.length;
    this.currentLanguage = this.availableLanguages[idx];
    this.translate.use(this.currentLanguage);
  }
}