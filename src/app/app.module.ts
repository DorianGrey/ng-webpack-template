import {NgModule, ApplicationRef} from "@angular/core";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";

import {TranslateModule} from "ng2-translate";

import {Store} from "@ngrx/store";
import {createNewHosts, createInputTransfer, removeNgStyles} from "@angularclass/hmr/dist/helpers";

import {App} from "./app.component";
import {APP_ROUTES, appRoutingProviders} from "./app.routes";
import {AppState, createStoreProvider} from "./app.store";
import {InputTestModule} from "./input-test/input-test.module";
import {TodosModule} from "./todos/todos.module";
import {SharedModule} from "./shared/shared.module";
import {NotFoundComponent} from "./not-found/not-found.component";


const IMPORTS = [
  BrowserModule, // Should only be imported by the root => every other module should import "CommonModule".
  HttpModule,
  APP_ROUTES,
  TranslateModule.forRoot(),
  SharedModule,
  InputTestModule,
  TodosModule,
  createStoreProvider()
];

@NgModule({
  imports: IMPORTS,
  providers: [appRoutingProviders],
  declarations: [NotFoundComponent, App],
  bootstrap: [App]
})
export class AppModule {
  constructor(public appRef: ApplicationRef,
              private _store: Store<AppState>) {
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