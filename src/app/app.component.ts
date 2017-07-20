import indexOf from "lodash-es/indexOf";
import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs/Observable";

import { CoreAppState, getLanguage } from "./app.store";
import { SetLanguageAction } from "./i18n/language.store";

@Component({
  selector: "app-root",
  styleUrls: ["./app.component.scss"],
  templateUrl: "./app.component.html"
})
export class AppComponent {
  currentLanguage: Observable<string>;

  private availableLanguages: string[];

  constructor(
    private translate: TranslateService,
    private store: Store<CoreAppState>
  ) {
    this.currentLanguage = this.store.select(getLanguage);
    this.availableLanguages = this.translate.getLangs();
  }

  rotateLanguage() {
    this.currentLanguage.take(1).subscribe(lang => {
      const idx =
        (indexOf(this.availableLanguages, lang) + 1) %
        this.availableLanguages.length;
      const nextLang = this.availableLanguages[idx];
      this.translate.use(nextLang);
      this.store.dispatch(new SetLanguageAction(nextLang));
    });
  }
}
