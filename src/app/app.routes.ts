import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotesComponent } from './notes/notes.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'notes', component: NotesComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/notes', pathMatch: 'full' }
];
