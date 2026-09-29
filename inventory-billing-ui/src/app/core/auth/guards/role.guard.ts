import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[] | undefined;

  // Allow access when no role restriction is configured.
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Redirect unauthenticated users to the login page.
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Allow access if the user has at least one permitted role.
  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  // Redirect users who lack the required role.
  return router.createUrlTree(['/dashboard']);
};