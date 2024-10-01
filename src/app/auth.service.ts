import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  get isAuthenticated() {
    return this.isAuthenticatedSignal();
  }

  login(username: string, password: string): boolean {
    // Simple mock authentication
    if (username === 'admin' && password === 'admin') {
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }

  private checkAuthStatus(): void {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    this.isAuthenticatedSignal.set(isAuthenticated);
  }
}
