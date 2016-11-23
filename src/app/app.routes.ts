import {Routes, RouterModule} from "@angular/router";

const appRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "input-test"
  },
  {
    path:         "lazy-test",
    // This one gets process by angular2-router-loader (https://github.com/brandonroberts/angular2-router-loader)
    loadChildren: "./+lazy-test/lazy-test.module#LazyTestModule"
  }
];

export const appRoutingProviders: any[] = [];


export const APP_ROUTES = RouterModule.forRoot(appRoutes);