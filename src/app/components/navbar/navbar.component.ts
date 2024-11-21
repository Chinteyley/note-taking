import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services";
@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="bg-indigo-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <a routerLink="/notes" class="text-white text-xl font-bold"
                >Notes App</a
              >
            </div>
          </div>
          <div class="flex items-center">
            @if (authService.isAuthenticated) {
              <button
                (click)="onLogout()"
                class="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            } @else {
              <a
                routerLink="/login"
                class="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </a>
            }
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  onLogout(): void {
    this.authService.logout();
  }
}
