import { NgModule, ApplicationRef } from "@angular/core";

import "rxjs/add/operator/take";

import { TranslateService } from "@ngx-translate/core";

import { Store } from "@ngrx/store";

import {
  createNewHosts,
  createInputTransfer,
  removeNgStyles
} from "@angularclass/hmr/dist/helpers";

import { AppComponent } from "./app.component";
import { appRoutingProviders } from "./app.routes";
import { AppState, getLanguage } from "./app.store";
import { NotFoundComponent } from "./not-found/not-found.component";
import translations from "../generated/translations";
import { LangActionCreator } from "./i18n/language.store";
import { APP_IMPORTS } from "./app.imports";

@NgModule({
  imports: APP_IMPORTS,
  providers: [appRoutingProviders, LangActionCreator],
  declarations: [NotFoundComponent, AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    public appRef: ApplicationRef,
    private _store: Store<AppState>,
    translate: TranslateService
  ) {
    translate.addLangs(Object.keys(translations));
    // TODO: It might be useful to put this to a different position... however, for now, it's perfectly valid.
    _store.select(getLanguage).subscribe(lang => {
      translate.use(lang);
    });
  }

  hmrOnInit(store: any) {
    if (!store || !store.rootState) {
      return;
    }

    // restore state by dispatch a SET_ROOT_STATE action
    if (store.rootState) {
      this._store.dispatch({
        type: "SET_ROOT_STATE",
        payload: store.rootState
      });
    }

    if ("restoreInputValues" in store) {
      store.restoreInputValues();
    }
    this.appRef.tick();
    Object.keys(store).forEach(prop => delete store[prop]);
  }

  hmrOnDestroy(store: any) {
    const cmpLocation = this.appRef.components.map(
      cmp => cmp.location.nativeElement
    );
    this._store.take(1).subscribe(s => (store.rootState = s));
    store.disposeOldHosts = createNewHosts(cmpLocation);
    store.restoreInputValues = createInputTransfer();
    removeNgStyles();
  }

  hmrAfterDestroy(store: any) {
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
