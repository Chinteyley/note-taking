import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError, Subject } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Router } from "@angular/router";

interface AuthResponse {
  token: string;
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "/api";
  private authToken = new BehaviorSubject<string | null>(null);
  private initialized = false;

  private logoutSubject = new Subject<void>();
  logout$ = this.logoutSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (this.initialized) return;

    const token = localStorage.getItem("authToken");
    if (token) {
      this.authToken.next(token);
    }
    else {
      this.authToken.next(null)
    }
    this.initialized = true;
  }

  get isAuthenticated(): boolean {
    return !!this.authToken.value;
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token available");
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { username, password })
      .pipe(
        tap((response) => {
          console.log("Registration successful:", response);
        }),
        catchError((error) => {
          console.error("Registration error:", error);
          return throwError(
            () => new Error(error.error?.message || "Registration failed"),
          );
        }),
      );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem("authToken", response.token);
          this.authToken.next(response.token);
        }),
        catchError((error) => {
          console.error("Login error:", error);
          return throwError(
            () => new Error(error.error?.message || "Username or Password is incorrect"),
          );
        }),
      );
  }

  logout(): void {
    localStorage.removeItem("authToken");
    this.authToken.next(null);
    this.router.navigate(["/login"]);
  }

  getAuthState(): Observable<string | null> {
    return this.authToken.asObservable();
  }
  checkAuthStatus(): Observable<boolean> {
    return new Observable(observer => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.authToken.next(null);
        observer.next(false);
        observer.complete();
        return;
      }

      // Optionally verify token with backend
      this.http.get(`${this.apiUrl}/verify-token`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).subscribe({
        next: () => {
          this.authToken.next(token);
          observer.next(true);
          observer.complete();
        },
        error: () => {
          localStorage.removeItem('authToken');
          this.authToken.next(null);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}
