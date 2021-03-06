import { BrowserModule } from "@angular/platform-browser";

import { StoreModule } from "@ngrx/store";
import { StoreRouterConnectingModule } from "@ngrx/router-store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";

import { createTranslateLoader } from "./translate.factory";
import { APP_ROUTES } from "./app.routes";
import { SharedModule } from "./shared/shared.module";
import { InputTestModule } from "./input-test/input-test.module";
import { TodosModule } from "./todos/todos.module";
import { reducers, metaReducers } from "./app.store";
import { ServiceWorkerModule } from "./service-worker/service-worker.module";

/*
  The list of app-level imports got externalized since it's not a fixed one, but may vary in the different
  ENV modes. Esp. for readability, these calculations got externalized.
 */

// We need to do some tricks here to be able to load the ngrx modules - where one is only referenced
// conditionally - in between the other modules, but always before the `SharedModule`.
// See this issue comment for details about the import order:
// https://github.com/ngrx/platform/issues/624#issuecomment-360147672
const ngrxImportModules = [
  StoreModule.forRoot(reducers, { metaReducers }),
  StoreRouterConnectingModule
];
/*
 Note: We only consider this extension to be useful in development mode.
 If you want to use in production as well, just remove the ENV-specific condition.
 */
if ("production" !== process.env.NODE_ENV) {
  ngrxImportModules.push(StoreDevtoolsModule.instrument({ maxAge: 50 }));
}

const imports = [
  BrowserModule, // Should only be imported by the root => every other module should import "CommonModule".
  APP_ROUTES,
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: createTranslateLoader
    }
  }),

  ...ngrxImportModules,
  SharedModule.forRoot(),
  InputTestModule,
  TodosModule,
  ServiceWorkerModule
];

export const APP_IMPORTS = imports;
