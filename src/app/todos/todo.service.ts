import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {List} from "immutable";

import {TodoActionCreator} from "./todos.store";
import {Todo} from "./todo.model";
import {AppState, getCompletedTodos, getCurrentTodos} from "../app.store";

@Injectable()
export class TodoService {
  public todos: Observable<List<Todo>>;
  public completedTodos: Observable<List<Todo>>;

  constructor(private store: Store<AppState>, private actionCreator: TodoActionCreator) {
    this.todos          = this.store.select(getCurrentTodos);
    this.completedTodos = this.store.select(getCompletedTodos);
  }

  add(todo: Todo) {
    this.store.dispatch(this.actionCreator.add(todo));
  }

  complete(todo: Todo) {
    this.store.dispatch(this.actionCreator.complete(todo));
  }
}