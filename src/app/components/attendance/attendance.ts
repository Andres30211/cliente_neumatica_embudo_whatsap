import { Component } from '@angular/core';
import { AttendanceResponse, AttendanceService } from '../../services/attendance-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-attendance',
  imports: [CommonModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance {


  loading = false;

  message = '';

  errorMessage = '';

  attendance?: AttendanceResponse;


  constructor(
    private attendanceService: AttendanceService
  ) {}


  /*
   * =====================================================
   * TOMAR ASISTENCIA
   * =====================================================
   */
  takeAttendance(): void {

    this.loading = true;

    this.message = '';

    this.errorMessage = '';


    /*
     * Verificamos si el navegador soporta GPS.
     */
    if (!navigator.geolocation) {

      this.loading = false;

      this.errorMessage =
        'Tu dispositivo no soporta geolocalización.';

      return;
    }


    /*
     * Solicitamos la ubicación al navegador.
     */
    navigator.geolocation.getCurrentPosition(

      /*
       * ÉXITO
       */
      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const accuracy =
          position.coords.accuracy;


        console.log('Latitud:', latitude);

        console.log('Longitud:', longitude);

        console.log('Precisión:', accuracy);


        /*
         * Enviamos solamente:
         *
         * latitude
         * longitude
         * accuracy
         *
         * NO enviamos userId.
         */
        this.attendanceService
          .checkIn({

            latitude,

            longitude,

            accuracy

          })
          .subscribe({

            next: (response) => {

              this.loading = false;

              this.attendance = response;


              if (response.insideCompany) {

                this.message =
                  'Asistencia registrada correctamente.';

              } else {

                this.message =
                  'Asistencia registrada. Estás fuera de la empresa.';
              }

            },


            error: (error) => {

              this.loading = false;

              console.error(error);

              this.errorMessage =
                error?.error?.message ||
                'No fue posible registrar la asistencia.';
            }

          });
      },


      /*
       * ERROR
       */
      (error) => {

        this.loading = false;

        console.error(
          'Error obteniendo ubicación:',
          error
        );


        switch (error.code) {

          case error.PERMISSION_DENIED:

            this.errorMessage =
              'Debes permitir el acceso a tu ubicación.';

            break;


          case error.POSITION_UNAVAILABLE:

            this.errorMessage =
              'No fue posible obtener tu ubicación.';

            break;


          case error.TIMEOUT:

            this.errorMessage =
              'La solicitud de ubicación tardó demasiado.';

            break;


          default:

            this.errorMessage =
              'Ocurrió un error obteniendo tu ubicación.';
        }

      },

      /*
       * Opciones del GPS.
       */
      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0
      }
    );
  }


  /*
   * =====================================================
   * CHECK-OUT
   * =====================================================
   */
  takeCheckout(): void {

    this.loading = true;

    this.message = '';

    this.errorMessage = '';


    this.attendanceService
      .checkOut()
      .subscribe({

        next: (response) => {

          this.loading = false;

          this.attendance = response;

          this.message =
            'Salida registrada correctamente.';
        },


        error: (error) => {

          this.loading = false;

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'No fue posible registrar la salida.';
        }

      });
  }
}