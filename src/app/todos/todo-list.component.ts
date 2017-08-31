import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { List } from "immutable";
import assign from "lodash-es/assign";

import { TodoService } from "./todo.service";
import { Todo } from "./todo.model";

@Component({
  selector: "todo-list",
  styleUrls: ["./todo-list.component.scss"],
  templateUrl: "./todo-list.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodoListComponent {
  todoText: string;
  todos: Observable<List<Todo>>;
  completedTodos: Observable<List<Todo>>;

  constructor(private todoService: TodoService) {
    this.todos = todoService.todos;
    this.completedTodos = todoService.completedTodos;
  }

  add() {
    this.todoService.add(<Todo>{
      text: this.todoText,
      addedTimestamp: Date.now()
    });
    this.todoText = "";
  }

  complete(todo: Todo) {
    this.todoService.complete(
      assign(
        { ...todo },
        {
          done: true,
          completedTimestamp: Date.now()
        }
      )
    );
  }
}
