import { TestBed, inject } from "@angular/core/testing";
import { TodoService } from "./todo.service";
import { StoreModule, Store } from "@ngrx/store";
import { todosReducer, AddTodoAction, CompleteTodoAction } from "./todos.store";
import { Observable } from "rxjs/Observable";
import { List } from "immutable";

describe("TodoService", () => {
  let todoService: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TodoService],
      imports: [
        StoreModule.forRoot(
          { todos: todosReducer },
          {
            initialState: {
              todos: {
                current: List.of(),
                completed: List.of()
              }
            }
          }
        )
      ]
    });
  });

  beforeEach(
    inject([TodoService], (_todoService: TodoService) => {
      todoService = _todoService;
    })
  );

  describe("todos", () => {
    it("should be an Observable", () => {
      expect(todoService.todos).toBeDefined();
      expect(todoService.todos instanceof Observable).toBeTruthy();
    });
  });

  describe("completedTodos", () => {
    it("should be an Observable", () => {
      expect(todoService.completedTodos).toBeDefined();
      expect(todoService.completedTodos instanceof Observable).toBeTruthy();
    });
  });

  describe("add()", () => {
    it(
      "should add a todo to the store",
      inject([Store], (store: Store<any>) => {
        spyOn(store, "dispatch");

        todoService.add({ text: "Some Task" });

        expect(store.dispatch).toHaveBeenCalledWith(
          new AddTodoAction({ text: "Some Task" })
        );
      })
    );
  });

  describe("complete()", () => {
    it(
      "should call to move a todo to the 'completed' stage",
      inject([Store], (store: Store<any>) => {
        spyOn(store, "dispatch");

        todoService.complete({ text: "Some Task" });

        expect(store.dispatch).toHaveBeenCalledWith(
          new CompleteTodoAction({ text: "Some Task" })
        );
      })
    );
  });
});
