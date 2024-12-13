import { Component, OnInit } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { LoginComponent } from "./components/auth";
import { NavbarComponent } from "./components/navbar";
import { CommonModule } from "@angular/common";
import { MarkdownModule } from "ngx-markdown";
import { AuthService } from "./services";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LoginComponent,
    NavbarComponent,
    MarkdownModule,
  ],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit {
  title: string = "notes-taking";

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.checkAuthStatus().subscribe((isAuthenticated) => {
      if (!isAuthenticated) {
        this.router.navigate(["/login"]);
      }
    });
  }
}
