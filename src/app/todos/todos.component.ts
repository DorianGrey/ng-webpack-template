import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {List} from "immutable";
import assign from "lodash-es/assign";

import {TodoService} from "./todo.service";
import {Todo} from "./todo.model";

@Component({
  selector:    "todos",
  templateUrl: "./todos.component.html"
})
export class TodosComponent {
  todoText: string;
  todos: Observable<List<Todo>>;
  completedTodos: Observable<List<Todo>>;

  constructor(private todoService: TodoService) {
    this.todos          = todoService.todos;
    this.completedTodos = todoService.completedTodos;
  }

  add() {
    this.todoService.add({text: this.todoText});
    this.todoText = "";
  }

  complete(todo: Todo) {
    this.todoService.complete(assign({...todo}, {done: true}));
  }
}