import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { routes } from "./app.routes";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { AuthService } from "./services";
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMarkdown(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    AuthService
  ],
};
