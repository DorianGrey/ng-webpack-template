import {BrowserModule} from "@angular/platform-browser";

import {StoreModule} from "@ngrx/store";
import {RouterStoreModule} from "@ngrx/router-store";

import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {createTranslateLoader} from "./translate.factory";

import {APP_ROUTES} from "./app.routes";
import {SharedModule} from "./shared/shared.module";
import {InputTestModule} from "./input-test/input-test.module";
import {TodosModule} from "./todos/todos.module";
import {rootReducer} from "./app.store";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";

/*
  The list of app-level imports got externalized since it's not a fixed one, but may vary in the different
  ENV modes. Esp. for readability, these calculations got externalized.
 */

const imports = [
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
  StoreModule.provideStore(rootReducer),
  RouterStoreModule.connectRouter()
];

/*
 Note: We only consider this extension to be useful in development mode.
 If you want to use in production as well, just remove the ENV-specific condition.
 */
if (ENV !== "production") {
  imports.push(StoreDevtoolsModule.instrumentOnlyWithExtension());
}

export const APP_IMPORTS = imports;