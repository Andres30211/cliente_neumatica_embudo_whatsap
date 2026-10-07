import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokensServices } from '../services/tokens-services';

export const authGuardGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const tokensServices = inject(TokensServices);

  /*
   * TokensServices se encarga de buscar el token
   * tanto en localStorage como en sessionStorage.
   */
  const token = tokensServices.getAccesToken();

  /*
   * Si existe un Access Token,
   * permitimos el acceso.
   *
   * Si el token ya expiró, el interceptor se encargará
   * de intentar renovarlo mediante el Refresh Token
   * cuando se haga una petición al backend.
   */
  if (token) {
    return true;
  }

  /*
   * No existe sesión.
   * Mandamos al usuario al login.
   */
  return router.createUrlTree(['/login']);
};