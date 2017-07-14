import { RouterModule } from "@angular/router";
import { TodoListComponent } from "./todo-list.component";
import { ModuleWithProviders } from "@angular/core";

export const TODO_ROUTES: ModuleWithProviders = RouterModule.forChild([
  {
    path: "todo-list",
    component: TodoListComponent
  }
]);
