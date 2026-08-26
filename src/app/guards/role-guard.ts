import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokensServices } from '../services/tokens-services';

export const roleGuard: CanActivateFn = (route, state) => {
  
  const tokensService = inject(TokensServices);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  const userRoles = tokensService.getRoles();

  const hasRole = requiredRoles.some(role =>
    userRoles.includes(role)
  );

  if (hasRole) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
