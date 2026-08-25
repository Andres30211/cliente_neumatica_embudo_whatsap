import { HttpInterceptorFn } from '@angular/common/http';
import { AuthServices } from '../services/auth-services';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokensServices } from '../services/tokens-services';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterdeptorInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthServices);
  const tokensService = inject(TokensServices);
  const router = inject(Router);

  const accessToken = tokensService.getAccesToken();

  // Si no existe Access Token,
  // dejamos pasar la petición normalmente.
  if (!accessToken) {
    return next(req);
  }

  // Agregamos el Access Token a la petición.
  const authReq = req.clone({setHeaders: {Authorization: `Bearer ${accessToken}`}});

  return next(authReq).pipe(

    catchError(error => {

      // Si no es 401, dejamos pasar el error.
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // El Access Token probablemente expiró.
      const refreshToken = tokensService.getRefreshToken();

      // Si tampoco tenemos Refresh Token,
      // ya no podemos renovar la sesión.
      if (!refreshToken) {

        tokensService.clearTokens();

        router.navigate(['/login']);

        return throwError(() => error);
      }

      // Intentamos obtener un nuevo Access Token.
      return authService.refreshToken().pipe(

        switchMap(response => {

          // Guardamos los nuevos tokens.
          tokensService.saveTokens(response.accessToken,response.refreshToken);

          // Repetimos la petición original
          // utilizando el nuevo Access Token.
          const retryReq = req.clone({setHeaders: {Authorization: `Bearer ${response.accessToken}`}});

          return next(retryReq);
        }),

        catchError(refreshError => {

          // Si el Refresh Token también expiró
          // o fue rechazado por Spring.
          tokensService.clearTokens();

          router.navigate(['/login']);

          return throwError(() => refreshError);
        })
      );
    })
  );
};
