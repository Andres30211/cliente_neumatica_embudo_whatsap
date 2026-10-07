import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  switchMap,
  take,
  throwError
} from 'rxjs';

import { AuthServices } from '../services/auth-services';
import { TokensServices } from '../services/tokens-services';


/*
 * Indica si actualmente hay una renovación
 * del Access Token en progreso.
 *
 * Esto evita que varias peticiones hagan
 * múltiples refresh simultáneamente.
 */
let isRefreshing = false;


/*
 * Las peticiones que lleguen mientras se está
 * renovando el token esperan aquí.
 *
 * Cuando tengamos el nuevo token:
 *
 * refreshTokenSubject.next(nuevoToken)
 *
 * y todas las peticiones pendientes continúan.
 */
const refreshTokenSubject =
  new BehaviorSubject<string | null>(null);


export const authInterdeptorInterceptor: HttpInterceptorFn =
  (req, next) => {

    const authService = inject(AuthServices);
    const tokensService = inject(TokensServices);
    const router = inject(Router);


    /*
     * Obtenemos el Access Token.
     *
     * TokensServices busca primero en localStorage
     * y después en sessionStorage.
     */
    const accessToken =
      tokensService.getAccesToken();


    /*
     * IMPORTANTE:
     *
     * La petición para renovar el token
     * no debe pasar nuevamente por este
     * mecanismo.
     */
    if (req.url.includes('/refresh')) {

      return next(req);
    }


    /*
     * Algunas peticiones pueden hacerse
     * sin autenticación.
     *
     * Si no existe Access Token,
     * dejamos pasar la petición normalmente.
     */
    if (!accessToken) {

      return next(req);
    }


    /*
     * Agregamos el Access Token a la petición.
     */
    const authReq = req.clone({

      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }

    });


    /*
     * Ejecutamos la petición.
     */
    return next(authReq).pipe(

      catchError(error => {

        /*
         * Si el error NO es 401,
         * no intentamos renovar el token.
         */
        if (error.status !== 401) {

          return throwError(() => error);
        }


        /*
         * La petición recibió 401.
         *
         * Esto normalmente significa que
         * el Access Token expiró.
         */

        const refreshToken =
          tokensService.getRefreshToken();


        /*
         * Si no tenemos Refresh Token,
         * ya no podemos renovar la sesión.
         */
        if (!refreshToken) {

          tokensService.clearTokens();

          router.navigate(['/login']);

          return throwError(() => error);
        }


        /*
         * ------------------------------------------------
         * CASO 1:
         * YA HAY OTRO REFRESH EN PROGRESO
         * ------------------------------------------------
         */

        if (isRefreshing) {

          /*
           * Esperamos hasta que la primera petición
           * termine de renovar el token.
           */
          return refreshTokenSubject.pipe(

            /*
             * Ignoramos el null inicial.
             */
            filter(token => token !== null),

            /*
             * Solo necesitamos el siguiente token.
             */
            take(1),

            /*
             * Cuando tengamos el nuevo token,
             * repetimos la petición original.
             */
            switchMap(newAccessToken => {

              const retryReq = req.clone({

                setHeaders: {
                  Authorization:
                    `Bearer ${newAccessToken}`
                }

              });

              return next(retryReq);
            })

          );
        }


        /*
         * ------------------------------------------------
         * CASO 2:
         * SOMOS LA PRIMERA PETICIÓN QUE DETECTA 401
         * ------------------------------------------------
         */

        isRefreshing = true;

        /*
         * Ponemos null para indicar que todavía
         * no tenemos un nuevo token.
         */
        refreshTokenSubject.next(null);


        /*
         * Pedimos al backend un nuevo Access Token.
         */
        return authService.refreshToken().pipe(

          /*
           * Cuando el backend responde correctamente:
           */
          switchMap(response => {

            /*
             * IMPORTANTE:
             *
             * NO pasamos false aquí.
             *
             * Dejamos que TokensServices detecte
             * dónde estaba guardada la sesión:
             *
             * localStorage -> localStorage
             * sessionStorage -> sessionStorage
             */
            tokensService.saveTokens(
              response.accessToken,
              response.refreshToken
            );


            /*
             * Avisamos a todas las peticiones
             * que estaban esperando.
             */
            refreshTokenSubject.next(
              response.accessToken
            );


            /*
             * Repetimos la petición original
             * con el nuevo Access Token.
             */
            const retryReq = req.clone({

              setHeaders: {
                Authorization:
                  `Bearer ${response.accessToken}`
              }

            });


            return next(retryReq);
          }),


          /*
           * ------------------------------------------------
           * EL REFRESH TOKEN TAMBIÉN FALLÓ
           * ------------------------------------------------
           */
          catchError(refreshError => {

            /*
             * La sesión completa deja de ser válida.
             */
            tokensService.clearTokens();


            /*
             * Desbloqueamos las peticiones que
             * estuvieran esperando.
             */
            refreshTokenSubject.next(null);


            /*
             * Mandamos al usuario al login.
             */
            router.navigate(['/login']);


            return throwError(() => refreshError);
          }),


          /*
           * Independientemente de si el refresh
           * tuvo éxito o falló, liberamos el estado.
           */
          finalize(() => {

            isRefreshing = false;
          })

        );

      })

    );
  };