import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth';

export const farmerGuard: CanActivateFn =
  () => {

    const authService =
      inject(AuthService);

    const router =
      inject(Router);

    if (!authService.isLoggedIn()) {

      return router.createUrlTree([
        '/login'
      ]);

    }

    if (
      authService.getRole() === 'Farmer'
    ) {
      return true;
    }

    return router.createUrlTree([
      '/seller/dashboard'
    ]);
  };