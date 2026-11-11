import {
  inject,
  PLATFORM_ID
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  HttpInterceptorFn
} from '@angular/common/http';


export const authInterceptor:
  HttpInterceptorFn =
  (request, next) => {

    const platformId =
      inject(PLATFORM_ID);


    const isBrowser =
      isPlatformBrowser(
        platformId
      );


    // During SSR there is no localStorage.
    if (!isBrowser) {

      return next(request);

    }


    const token =
      localStorage.getItem(
        'token'
      );


    const isPublicAuthRequest =
      request.url.includes(
        '/api/auth/login'
      )
      ||
      request.url.includes(
        '/api/auth/register'
      );


    if (
      !token ||
      isPublicAuthRequest
    ) {

      return next(request);

    }


    const authenticatedRequest =
      request.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`

        }

      });


    return next(
      authenticatedRequest
    );
  };