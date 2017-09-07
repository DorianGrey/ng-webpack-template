import { NgModule } from "@angular/core";
import { StoreModule } from "@ngrx/store";

import { ServiceWorkerService } from "./service-worker.service";
import {
  SERVICE_WORKER_FEATURE_NAME,
  serviceWorkerStateReducer
} from "./service-worker.store";

@NgModule({
  imports: [
    StoreModule.forFeature(
      SERVICE_WORKER_FEATURE_NAME,
      serviceWorkerStateReducer
    )
  ],
  providers: [ServiceWorkerService]
})
export class ServiceWorkerModule {}
