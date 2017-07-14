import { ModuleWithProviders } from "@angular/core";
import { RouterModule } from "@angular/router";
import { InputTestComponent } from "./input-test.component";

export const INPUT_TEST_ROUTES: ModuleWithProviders = RouterModule.forChild([
  {
    path: "input-test",
    component: InputTestComponent
  }
]);
