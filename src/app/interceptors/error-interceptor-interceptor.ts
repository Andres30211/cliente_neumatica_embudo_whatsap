import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationServices } from '../services/notification-services';

export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {

  const notificationService = inject(NotificationServices);

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      let message = 'Ocurrió un error inesperado';

      if (error.error?.message) {
        message = error.error.message;
      }

      switch (error.status) {

        case 400:
          notificationService.error(
            'Solicitud inválida',
            message
          );
          break;

        case 401:
          /*
           * El AuthInterceptor se encarga
           * de los errores 401.
           *
           * No mostramos SweetAlert aquí.
           */
          break;

        case 403:
          notificationService.error(
            'Acceso denegado',
            message
          );
          break;

        case 404:
          notificationService.error(
            'No encontrado',
            message
          );
          break;

        case 409:
          notificationService.error(
            'Conflicto',
            message
          );
          break;

        case 500:
          notificationService.error(
            'Error del servidor',
            message
          );
          break;

        default:
          notificationService.error(
            'Error',
            message
          );
          break;
      }

      return throwError(() => error);
    })
  );
};


// import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { catchError, throwError } from 'rxjs';
// import { NotificationServices } from '../services/notification-services';

// export const errorInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  
//   const notificationService = inject(NotificationServices);

//     return next(req).pipe(

//       catchError((error: HttpErrorResponse) => {

//           let message = 'Ocurrió un error inesperado';


//           if (error.error?.message) {

//             message = error.error.message;

//           }

//           switch (error.status) {

//             case 400:

//               notificationService.error('Solicitud inválida',message);

//               break;

//             case 401:

//               notificationService.error('No autorizado',message);

//               break;

//             case 403:

//               notificationService.error('Acceso denegado',message);

//               break;

//             case 404:

//               notificationService.error('No encontrado',message);

//               break;

//             case 409:

//               notificationService.error('Conflicto',message);

//               break;

//             case 500:

//               notificationService.error('Error del servidor',message);

//               break;

//             default:

//               notificationService.error('Error',message);

//               break;
//           }

//           return throwError(() => error);

//         }
//       )
//     );

// };
