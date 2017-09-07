import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";

import {
  State as ServiceWorkerStateInfo,
  ServiceWorkerStateSlice,
  getServiceWorkerInfo
} from "./service-worker.store";
import registerServiceWorker from "./service-worker.register";

@Injectable()
export class ServiceWorkerService {
  stateInfo: Observable<ServiceWorkerStateInfo>;

  constructor(private store: Store<ServiceWorkerStateSlice>) {
    this.stateInfo = this.store.select(getServiceWorkerInfo);

    registerServiceWorker(store);
  }
}
