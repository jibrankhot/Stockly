import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = _route.data['roles'] as string[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: {
        returnUrl: state.url,
      },
    });
  }

  if (authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};