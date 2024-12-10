import { Routes } from "@angular/router";
import { LoginComponent } from "./components/auth";
import { RegisterComponent } from "./components/auth";
import { NotesComponent } from "./components/notes";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "notes", component: NotesComponent, canActivate: [authGuard] },
  { path: "", redirectTo: "/notes", pathMatch: "full" },
  { path: "**", redirectTo: "/notes"}
];
