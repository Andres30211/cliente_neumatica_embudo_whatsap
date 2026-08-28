import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, finalize, switchMap, take, throwError } from 'rxjs';

import { AuthServices } from '../services/auth-services';
import { TokensServices } from '../services/tokens-services';

let isRefreshing = false;

const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterdeptorInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthServices);
  const tokensService = inject(TokensServices);
  const router = inject(Router);

  const accessToken = tokensService.getAccesToken();

  /*
   * IMPORTANTE:
   * La petición de refresh NO debe entrar nuevamente
   * en el mecanismo de refresh.
   */
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  /*
   * Si no tenemos Access Token,
   * dejamos pasar la petición.
   */
  if (!accessToken) {
    return next(req);
  }

  /*
   * Agregamos Access Token.
   */
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return next(authReq).pipe(

    catchError(error => {

      /*
       * Si no es 401,
       * simplemente propagamos el error.
       */
      if (error.status !== 401) {
        return throwError(() => error);
      }

      const refreshToken = tokensService.getRefreshToken();

      /*
       * Si no tenemos Refresh Token,
       * cerramos sesión.
       */
      if (!refreshToken) {

        tokensService.clearTokens();

        router.navigate(['/login']);

        return throwError(() => error);
      }

      /*
       * Si YA hay un refresh en progreso,
       * NO hacemos otro refresh.
       *
       * Esperamos a que termine el refresh actual.
       */
      if (isRefreshing) {

        return refreshTokenSubject.pipe(

          filter(token => token !== null),

          take(1),

          switchMap(newAccessToken => {

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`
              }
            });

            return next(retryReq);

          })
        );
      }

      /*
       * Somos la primera petición que detectó
       * que el Access Token expiró.
       */
      isRefreshing = true;

      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(

        switchMap(response => {

          /*
           * Guardamos los nuevos tokens.
           */
          tokensService.saveTokens(
            response.accessToken,
            response.refreshToken
          );

          /*
           * Avisamos a las demás peticiones
           * que ya tenemos un nuevo Access Token.
           */
          refreshTokenSubject.next(response.accessToken);

          /*
           * Reintentamos la petición original.
           */
          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });

          return next(retryReq);

        }),

        catchError(refreshError => {

          /*
           * El Refresh Token tampoco sirve.
           */
          tokensService.clearTokens();

          refreshTokenSubject.next(null);

          router.navigate(['/login']);

          return throwError(() => refreshError);

        }),

        /*
         * Independientemente de si el refresh
         * terminó correctamente o con error,
         * liberamos el estado.
         */
        finalize(() => {
          isRefreshing = false;
        })

      );

    })

  );
};



// import { HttpInterceptorFn } from '@angular/common/http';
// import { AuthServices } from '../services/auth-services';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { TokensServices } from '../services/tokens-services';
// import { catchError, switchMap, throwError } from 'rxjs';

// export const authInterdeptorInterceptor: HttpInterceptorFn = (req, next) => {

//   const authService = inject(AuthServices);
//   const tokensService = inject(TokensServices);
//   const router = inject(Router);

//   const accessToken = tokensService.getAccesToken();

//   // Si no existe Access Token,
//   // dejamos pasar la petición normalmente.
//   if (!accessToken) {
//     return next(req);
//   }

//   // Agregamos el Access Token a la petición.
//   const authReq = req.clone({setHeaders: {Authorization: `Bearer ${accessToken}`}});

//   return next(authReq).pipe(

//     catchError(error => {

//       // Si no es 401, dejamos pasar el error.
//       if (error.status !== 401) {
//         return throwError(() => error);
//       }

//       // El Access Token probablemente expiró.
//       const refreshToken = tokensService.getRefreshToken();

//       // Si tampoco tenemos Refresh Token,
//       // ya no podemos renovar la sesión.
//       if (!refreshToken) {

//         tokensService.clearTokens();

//         router.navigate(['/login']);

//         return throwError(() => error);
//       }

//       // Intentamos obtener un nuevo Access Token.
//       return authService.refreshToken().pipe(

//         switchMap(response => {

//           // Guardamos los nuevos tokens.
//           tokensService.saveTokens(response.accessToken,response.refreshToken);

//           // Repetimos la petición original
//           // utilizando el nuevo Access Token.
//           const retryReq = req.clone({setHeaders: {Authorization: `Bearer ${response.accessToken}`}});

//           return next(retryReq);
//         }),

//         catchError(refreshError => {

//           // Si el Refresh Token también expiró
//           // o fue rechazado por Spring.
//           tokensService.clearTokens();

//           router.navigate(['/login']);

//           return throwError(() => refreshError);
//         })
//       );
//     })
//   );
// };
