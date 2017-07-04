import {Operator} from "rxjs/Operator";
import {Observable} from "rxjs/Observable";

// See issue https://github.com/ReactiveX/rxjs/issues/2539 .
// Remove this when a stable release of RxJS without the bug is available.
declare module "rxjs/Subject" {
  interface Subject<T> {
    lift<R>(operator: Operator<T, R>): Observable<R>;
  }
}