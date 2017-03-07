// Angular 2
import {enableDebugTools, disableDebugTools} from "@angular/platform-browser";
import {enableProdMode, ApplicationRef} from "@angular/core";

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T {
  return value;
};

if ("production" === ENV) {
  // Production
  // FIXME: In angular-4-rc.x, calling this function results in an error:
  // "Cannot read property 'setGlobalVar' of null" - it seems that the called "getDOM()" function returns null.
  // We'll skip this error and go ahead for now.
  try {
    disableDebugTools();
  } catch (e) {
    console.warn("Disabling debug tools failed, due to:", e);
  }
  enableProdMode();

} else {

  _decorateModuleRef = (modRef: any) => {
    const appRef = modRef.injector.get(ApplicationRef);
    const cmpRef = appRef.components[0];

    let _ng = (<any>window).ng;
    enableDebugTools(cmpRef);
    (<any>window).ng.probe      = _ng.probe;
    (<any>window).ng.coreTokens = _ng.coreTokens;
    return modRef;
  };
}

export const decorateModuleRef = _decorateModuleRef;