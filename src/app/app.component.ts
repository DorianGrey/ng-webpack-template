import indexOf from "lodash-es/indexOf";
import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs/Observable";
import { take } from "rxjs/operators/take";

import { CoreAppState, getLanguage } from "./app.store";
import { SetLanguageAction } from "./i18n/language.store";
import { ServiceWorkerService } from "./service-worker/service-worker.service";
import { ServiceWorkerStateValue } from "./service-worker/service-worker.store";

@Component({
  selector: "app-root",
  styleUrls: ["./app.component.scss"],
  templateUrl: "./app.component.html"
})
export class AppComponent {
  showMenu = false;
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

      // For the moment - testing purposes - just reload the location in case
      // the "new content" info is received.
      if (
        newInfo.value ===
        ServiceWorkerStateValue.STATE_INSTALLED_NEW_CONTENT_AVAILABLE
      ) {
        window.location.reload();
      }
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  rotateLanguage() {
    this.currentLanguage.pipe(take(1)).subscribe(lang => {
      const idx =
        (indexOf(this.availableLanguages, lang) + 1) %
        this.availableLanguages.length;
      const nextLang = this.availableLanguages[idx];
      this.translate.use(nextLang);
      this.store.dispatch(new SetLanguageAction(nextLang));
    });
  }
}
