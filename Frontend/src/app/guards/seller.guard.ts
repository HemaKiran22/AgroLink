import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth';

export const sellerGuard: CanActivateFn =
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
      authService.getRole() === 'Seller'
    ) {
      return true;
    }

    return router.createUrlTree([
      '/farmer/dashboard'
    ]);
  };