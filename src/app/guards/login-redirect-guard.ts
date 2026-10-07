import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokensServices } from '../services/tokens-services';

export const loginRedirectGuard: CanActivateFn = (route, state) => {
  
  const router = inject(Router);
  const tokensService = inject(TokensServices);

  /*
   * Buscamos el Access Token.
   *
   * TokensServices revisa:
   * 1. localStorage
   * 2. sessionStorage
   */
  const accessToken = tokensService.getAccesToken();

  /*
   * Si no existe Access Token,
   * mandamos al login.
   */
  if (!accessToken) {

    return router.createUrlTree(['/login']);
  }

  /*
   * Tenemos Access Token.
   *
   * Por ahora permitimos entrar a Home.
   *
   * El interceptor será el encargado de utilizar
   * el Refresh Token si posteriormente una petición
   * recibe un 401.
   */
  return router.createUrlTree(['/home']);
};
