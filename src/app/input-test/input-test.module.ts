import { NgModule } from "@angular/core";
import { InputTestComponent } from "./input-test.component";
import { INPUT_TEST_ROUTES } from "./input-test.routes";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [SharedModule, INPUT_TEST_ROUTES],
  declarations: [InputTestComponent]
})
export class InputTestModule {}
