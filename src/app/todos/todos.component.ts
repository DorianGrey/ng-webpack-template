import {Component, ViewChild} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {List} from "immutable";

import {TodoService} from "./todo.service";
import {Todo} from "./todo.model";

@Component({
  selector: "todos",
  templateUrl: "./todos.component.html"
})
export class TodosComponent {
  @ViewChild("name") name: any;
  private todos: Observable<List<Todo>>;

  constructor(private todoService: TodoService) {
    this.todos = todoService.todos;
  }

  add(name: string) {
    this.todoService.add({text: name});
    this.name.nativeElement.value = "";
  }
}