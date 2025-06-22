import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  if (user && user.role === 'ADMIN') {
    return true;
  }

  // Redirect to the user dashboard if not an admin
  return router.parseUrl('/dashboard');
};
