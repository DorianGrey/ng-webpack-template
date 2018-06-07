import { NgModule, ApplicationRef } from "@angular/core";

import { take } from "rxjs/operators";

import { TranslateService } from "@ngx-translate/core";

import { Store } from "@ngrx/store";
import { RouterStateSerializer } from "@ngrx/router-store";

import {
  createNewHosts,
  createInputTransfer,
  removeNgStyles
} from "@angularclass/hmr/dist/helpers";

import { AppComponent } from "./app.component";
import { appRoutingProviders } from "./app.routes";
import {
  CoreAppState,
  CustomRouterStateSerializer,
  getLanguage
} from "./app.store";
import { NotFoundComponent } from "./not-found/not-found.component";
import translations from "../generated/translations";
import { APP_IMPORTS } from "./app.imports";

@NgModule({
  imports: APP_IMPORTS,
  providers: [
    appRoutingProviders,
    { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer }
  ],
  declarations: [NotFoundComponent, AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    public appRef: ApplicationRef,
    private _store: Store<CoreAppState>,
    translate: TranslateService
  ) {
    translate.addLangs(Object.keys(translations));
    /*
      This subscription causes a language change on the translate service each time it
      is changed in the store. As a result, the store should be considered as the
      single source of truth for this parameter: If you want to change the language,
      you will only have to dispatch the corresponding to the store, and every part of
      the app relying on it - including the translate service - will be notified properly.
     */
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
    this._store.pipe(take(1)).subscribe(s => (store.rootState = s));
    store.disposeOldHosts = createNewHosts(cmpLocation);
    store.restoreInputValues = createInputTransfer();
    removeNgStyles();
  }

  hmrAfterDestroy(store: any) {
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
