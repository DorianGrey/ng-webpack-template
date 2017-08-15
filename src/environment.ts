// Angular 2
import { enableDebugTools } from "@angular/platform-browser";
import { enableProdMode } from "@angular/core";

// Angular debug tools in the dev console
// https://github.com/angular/angular/blob/86405345b781a9dc2438c0fbe3e9409245647019/TOOLS_JS.md
let _decorateModuleRef = function identity<T>(value: T): T {
  return value;
};

if ("production" === process.env.NODE_ENV) {
  // Since the debug tools are disabled by default in v4, we don't have to explicitly disable them as we had to before.
  enableProdMode();
} else {
  _decorateModuleRef = (modRef: any) => {
    /*
      Note: In earlier versions, it was required to pick a reference to the
      `window.ng` token for properly adding the debug tools without getting them overwritten
      by angular.

         const appRef = modRef.injector.get(ApplicationRef);
         const cmpRef = appRef.components[0];

         let _ng = (<any>window).ng;
         enableDebugTools(cmpRef);
         (<any>window).ng.probe      = _ng.probe;
         (<any>window).ng.coreTokens = _ng.coreTokens;

      This was tracked in https://github.com/angular/angular/issues/12002.
      Since the corresponding pull request https://github.com/angular/angular/pull/12003 is merged,
      this workaround is no longer required.
     */
    enableDebugTools(modRef);

    return modRef;
  };
}

export const decorateModuleRef = _decorateModuleRef;
