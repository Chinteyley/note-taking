import { Component, OnInit } from "@angular/core";
import { RouterLink, Router } from "@angular/router"; // Add Router import
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div
      class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label
                for="username"
                class="block text-sm font-medium text-gray-700"
              >
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
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
              >
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

            <!-- Add error message display -->
            @if (errorMessage) {
              <div class="text-red-600 text-sm">{{ errorMessage }}</div>
            }

            <div>
              <button
                type="submit"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">
                  Don't have an account?
                  <a
                    routerLink="/register"
                    class="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Register
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
export class LoginComponent {
  username = "";
  password = "";
  errorMessage = "";
  successMessage = "";
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router, // Add router injection
  ) {}

  ngOnInit(): void {
    // Check for registration success message
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { message: string };
    if (state?.message) {
      this.successMessage = state.message;
      // Clear the success message after 5 seconds
      setTimeout(() => {
        this.successMessage = "";
      }, 5000);
    }
  }
  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = "Please fill in all fields";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";
    this.successMessage = "";

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        console.log("Login successful");
        this.router.navigate(["/notes"]);
      },
      error: (error: Error) => {
        console.error("Login error:", error);
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }
}
