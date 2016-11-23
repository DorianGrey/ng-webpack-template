import {RouterModule} from "@angular/router";
import {LazyTestComponent} from "./lazy-test.component";

export const LAZY_TEST_ROUTES = RouterModule.forChild([
  {
    path:       "",
    component: LazyTestComponent
  }
]);