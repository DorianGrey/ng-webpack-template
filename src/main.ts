import "./styles/main.scss";
import "./polyfills";
import "rxjs/add/operator/take";

import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {enableProdMode} from "@angular/core";
import {bootloader} from '@angularclass/hmr';
// import {Store} from "@ngrx/store";
import {AppModule} from "./app/app.module";
import {decorateModuleRef} from "./environment";

if ("production" === ENV) {
  enableProdMode()
}

export function main(): Promise<any> {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(decorateModuleRef)
    .catch(err => console.error(err));
}

bootloader(main);