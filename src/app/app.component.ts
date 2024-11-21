import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { LoginComponent } from "./components/auth";
import { NavbarComponent } from "./components/navbar";
import { CommonModule } from "@angular/common";
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent, NavbarComponent, MarkdownModule],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  title: string = "notes-taking";
}
