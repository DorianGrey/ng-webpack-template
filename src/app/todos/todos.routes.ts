import {RouterModule} from "@angular/router";
import {TodosComponent} from "./todos.component";

export const TODO_ROUTES = RouterModule.forChild([
  {
    path:      "todos",
    component: TodosComponent
  }
]);