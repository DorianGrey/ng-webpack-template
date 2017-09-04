import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";

import { State as ServiceWorkerStateInfo } from "./service-worker.store";
import { CoreAppState, getServiceWorkerInfo } from "../app.store";
import registerServiceWorker from "./service-worker.register";

@Injectable()
export class ServiceWorkerService {
  stateInfo: Observable<ServiceWorkerStateInfo>;

  constructor(private store: Store<CoreAppState>) {
    this.stateInfo = this.store.select(getServiceWorkerInfo);

    registerServiceWorker(store);
  }
}
