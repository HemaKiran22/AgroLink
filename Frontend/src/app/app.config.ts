import { ApplicationConfig } from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';

import {
  authInterceptor
} from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    // Enables Angular routing
    provideRouter(routes),

    // Enables HttpClient and attaches
    // JWT interceptor to HTTP requests
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )

  ]
};