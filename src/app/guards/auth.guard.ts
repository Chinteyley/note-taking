import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services";
import { map, take } from "rxjs/operators";

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkAuthStatus().pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(["/login"]);
        return false;
      }
      return true;
    }),
  );
};
