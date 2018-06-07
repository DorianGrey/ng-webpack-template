import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { List } from "immutable";

import { AddTodoAction, CompleteTodoAction } from "./todos.store";
import { Todo } from "./todo.model";
import { CoreAppState, getCompletedTodos, getCurrentTodos } from "../app.store";

@Injectable()
export class TodoService {
  todos: Observable<List<Todo>>;
  completedTodos: Observable<List<Todo>>;

  constructor(private store: Store<CoreAppState>) {
    this.todos = this.store.select(getCurrentTodos);
    this.completedTodos = this.store.select(getCompletedTodos);
  }

  add(todo: Todo) {
    this.store.dispatch(new AddTodoAction(todo));
  }

  complete(todo: Todo) {
    this.store.dispatch(new CompleteTodoAction(todo));
  }
}
