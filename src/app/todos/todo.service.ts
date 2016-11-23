import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs/Observable";
import {List} from "immutable";

import {TodoActionCreator} from "./todos.store";
import {Todo} from "./todo.model";
import {AppState} from "../app.store";

@Injectable()
export class TodoService {
  public todos: Observable<List<Todo>>;
  constructor(private store: Store<AppState>, private actionCreator: TodoActionCreator) {
    this.todos = this.store.select(state => state.todos);
  }

  add(todo: Todo) {
    this.store.dispatch(this.actionCreator.add(todo));
  }
}