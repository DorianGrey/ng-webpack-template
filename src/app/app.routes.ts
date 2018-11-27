import { Routes, RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import { NotFoundComponent } from "./not-found/not-found.component";

const appRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "input-test"
  },
  {
    path: "lazy-test",
    // This one gets process by angular-router-loader (https://github.com/brandonroberts/angular-router-loader) in dev mode
    loadChildren: "./+lazy-test/lazy-test.module#LazyTestModule"
  },
  {
    path: "**",
    component: NotFoundComponent
  }
];

export const appRoutingProviders: any[] = [];

export const APP_ROUTES: ModuleWithProviders = RouterModule.forRoot(appRoutes);
