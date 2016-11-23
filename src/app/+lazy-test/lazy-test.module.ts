import {NgModule} from "@angular/core";

import {SharedModule} from "../shared/shared.module";

import {LAZY_TEST_ROUTES} from "./lazy-test.routes";
import {LazyTestComponent} from "./lazy-test.component";
import {LazyTestActionCreator} from "./lazy-test.store";
import {LazyTestService} from "./lazy-test.service";

@NgModule({
  imports:      [
    LAZY_TEST_ROUTES,
    SharedModule
  ],
  declarations: [
    LazyTestComponent
  ],
  providers:    [LazyTestService, LazyTestActionCreator]
})
export class LazyTestModule {
}