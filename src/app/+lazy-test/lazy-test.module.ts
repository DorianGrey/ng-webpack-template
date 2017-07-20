import { NgModule } from "@angular/core";

import { SharedModule } from "../shared/shared.module";

import { LAZY_TEST_ROUTES } from "./lazy-test.routes";
import { LazyTestComponent } from "./lazy-test.component";
import { LAZY_TEST_FEATURE_NAME, watchTimeReducer } from "./lazy-test.store";

import { LazyTestService } from "./lazy-test.service";
import { StoreModule } from "@ngrx/store";

@NgModule({
  imports: [
    LAZY_TEST_ROUTES,
    SharedModule,
    StoreModule.forFeature(LAZY_TEST_FEATURE_NAME, watchTimeReducer)
  ],
  declarations: [LazyTestComponent],
  providers: [LazyTestService]
})
export class LazyTestModule {}
