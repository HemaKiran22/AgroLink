import { inject } from '@angular/core';

import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth';
import { UserRole } from '../models/user';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. User must first be logged in
  if (!authService.isLoggedIn()) {
    return router.createUrlTree([
      '/login'
    ]);
  }

  // 2. Get required role from route configuration
  const requiredRole =
    route.data['role'] as UserRole | undefined;

  // If role was not configured on the route,
  // do not allow access.
  if (!requiredRole) {
    return router.createUrlTree([
      authService.getDashboardRoute()
    ]);
  }

  // 3. Get currently logged-in user's role
  const currentRole =
    authService.getRole();

  // 4. Allow when roles match
  if (currentRole === requiredRole) {
    return true;
  }

  // 5. Wrong role -> send user to their own dashboard
  return router.createUrlTree([
    authService.getDashboardRoute()
  ]);
};