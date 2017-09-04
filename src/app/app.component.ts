import indexOf from "lodash-es/indexOf";
import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs/Observable";

import { CoreAppState, getLanguage } from "./app.store";
import { SetLanguageAction } from "./i18n/language.store";
import { ServiceWorkerService } from "./service-worker/service-worker.service";

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
    private store: Store<CoreAppState>,
    serviceWorkerService: ServiceWorkerService
  ) {
    this.currentLanguage = this.store.select(getLanguage);
    this.availableLanguages = this.translate.getLangs();

    serviceWorkerService.stateInfo.subscribe(newInfo => {
      // You should do something valuable here, depending on the particular
      // state information.
      console.warn("New service worker state information:", newInfo);
    });
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
