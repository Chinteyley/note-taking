import { Component } from "@angular/core";
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                [(ngModel)]="username"
                name="username"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                [(ngModel)]="password"
                name="password"
                type="password"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            @if (errorMessage) {
              <div class="text-red-600 text-sm">{{ errorMessage }}</div>
            }

            <div>
              <button
                type="submit"
                [disabled]="isLoading"
                class="w-full flex justify-center btn btn-light-primary"
              >
                {{ isLoading ? "Registering..." : "Register" }}
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">
                  Already have an account?
                  <a
                    routerLink="/login"
                    class="btn btn-light-link"
                  >
                    Sign in
                  </a>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  username = "";
  password = "";
  errorMessage = "";
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = "Please fill in all fields";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        console.log("Registration successful");
        this.router.navigate(["/login"], {
          state: { message: "Registration successful. Please login." },
        });
      },
      error: (error: Error) => {
        console.error("Registration error:", error);
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }
}
