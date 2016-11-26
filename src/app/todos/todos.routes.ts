import {RouterModule} from "@angular/router";
import {TodosComponent} from "./todos.component";
import {ModuleWithProviders} from "@angular/core";

export const TODO_ROUTES: ModuleWithProviders = RouterModule.forChild([
  {
    path:      "todos",
    component: TodosComponent
  }
]);