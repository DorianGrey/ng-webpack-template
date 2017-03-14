import {NgModule, ApplicationRef} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";

import "rxjs/add/operator/take";

import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";

import {Store, StoreModule} from "@ngrx/store";
import {createNewHosts, createInputTransfer, removeNgStyles} from "@angularclass/hmr/dist/helpers";

import {App} from "./app.component";
import {APP_ROUTES, appRoutingProviders} from "./app.routes";
import {AppState, rootReducer} from "./app.store";
import {InputTestModule} from "./input-test/input-test.module";
import {TodosModule} from "./todos/todos.module";
import {SharedModule} from "./shared/shared.module";
import {NotFoundComponent} from "./not-found/not-found.component";
import {createTranslateLoader} from "./translate.factory";
import translations from "../generated/translations";
import {LangActionCreator} from "./i18n/language.store";

@NgModule({
  imports:      [
    BrowserModule, // Should only be imported by the root => every other module should import "CommonModule".
    APP_ROUTES,
    TranslateModule.forRoot({
      loader: {
        provide:    TranslateLoader,
        useFactory: createTranslateLoader
      }
    }),
    SharedModule.forRoot(),
    InputTestModule,
    TodosModule,
    StoreModule.provideStore(rootReducer)
  ],
  providers:    [
    appRoutingProviders,
    LangActionCreator
  ],
  declarations: [NotFoundComponent, App],
  bootstrap:    [App]
})
export class AppModule {
  constructor(public appRef: ApplicationRef,
              private _store: Store<AppState>,
              translate: TranslateService) {
    translate.addLangs(Object.keys(translations));
    // TODO: It might be useful to put this to a different position... however, for now, it's perfectly valid.
    _store
      .select(state => state.language)
      .subscribe(lang => {
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
        type:    "SET_ROOT_STATE",
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
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    this._store.take(1).subscribe(s => store.rootState = s);
    store.disposeOldHosts    = createNewHosts(cmpLocation);
    store.restoreInputValues = createInputTransfer();
    removeNgStyles();
  }

  hmrAfterDestroy(store: any) {
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}