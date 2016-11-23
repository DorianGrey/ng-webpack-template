import {NgModule} from "@angular/core";

import {SharedModule} from "../shared/shared.module";

import {LAZY_TEST_ROUTES} from "./lazy-test.routes";
import {LazyTestComponent} from "./lazy-test.component";

@NgModule({
  imports:      [
    LAZY_TEST_ROUTES,
    SharedModule
  ],
  declarations: [
    LazyTestComponent
  ]
})
export class LazyTestModule {
}