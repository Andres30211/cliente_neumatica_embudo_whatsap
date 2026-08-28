import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  AttendanceResponse,
  AttendanceAdminResponse,
  AttendanceService
} from '../../services/attendance-service';

import { Topbar } from "../topbar/topbar";
import { Sidebar } from "../sidebar/sidebar";
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-attendance',

  standalone: true,

  imports: [
    CommonModule,
    Topbar,
    Sidebar,
    FormsModule
  ],

  templateUrl: './attendance.html',

  styleUrl: './attendance.css'
})
export class Attendance implements OnInit {


  /*
   * ==========================================
   * ESTADOS
   * ==========================================
   */

  loading = false;

  loadingAttendances = false;

  message = '';

  errorMessage = '';


  /*
   * ==========================================
   * ASISTENCIA DEL USUARIO
   * ==========================================
   */

  attendance?: AttendanceResponse;


  /*
   * ==========================================
   * ASISTENCIAS DEL DÍA
   * ==========================================
   */

  attendances: AttendanceAdminResponse[] = [];


  /*
   * ==========================================
   * FILTRO
   * ==========================================
   */

  searchTerm = '';


  /*
   * ==========================================
   * CONSTRUCTOR
   * ==========================================
   */

  constructor(
    private attendanceService: AttendanceService
  ) {}


  /*
   * ==========================================
   * INIT
   * ==========================================
   */

  ngOnInit(): void {

    this.loadTodayAttendances();

  }


  /*
   * ==========================================
   * TOMAR ASISTENCIA
   * ==========================================
   */

  takeAttendance(): void {

    this.loading = true;

    this.message = '';

    this.errorMessage = '';


    /*
     * Verificamos soporte GPS.
     */
    if (!navigator.geolocation) {

      this.loading = false;

      this.errorMessage =
        'Tu dispositivo no soporta geolocalización.';

      return;
    }


    /*
     * Obtener ubicación.
     */
    navigator.geolocation.getCurrentPosition(

      position => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const accuracy =
          position.coords.accuracy;


        /*
         * Enviamos ubicación al backend.
         *
         * NO enviamos userId.
         *
         * El backend lo obtiene del JWT.
         */
        this.attendanceService
          .checkIn({
            latitude,
            longitude,
            accuracy
          })
          .subscribe({

            next: response => {

              this.loading = false;

              this.attendance = response;


              if (response.insideCompany) {

                this.message =
                  'Asistencia registrada correctamente.';

              } else {

                this.message =
                  'Asistencia registrada. Estás fuera de la empresa.';
              }


              /*
               * Actualizamos tabla.
               */
              this.loadTodayAttendances();

            },


            error: error => {

              this.loading = false;

              console.error(error);

              this.errorMessage =
                error?.error?.message ||
                'No fue posible registrar la asistencia.';
            }

          });

      },


      error => {

        this.loading = false;

        console.error(error);


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


      {
        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0
      }

    );
  }


  /*
   * ==========================================
   * CHECK-OUT
   * ==========================================
   */

  takeCheckout(): void {

    this.loading = true;

    this.message = '';

    this.errorMessage = '';


    this.attendanceService
      .checkOut()
      .subscribe({

        next: response => {

          this.loading = false;

          this.attendance = response;

          this.message =
            'Salida registrada correctamente.';


          this.loadTodayAttendances();

        },


        error: error => {

          this.loading = false;

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'No fue posible registrar la salida.';
        }

      });
  }


  /*
   * ==========================================
   * CARGAR ASISTENCIAS DEL DÍA
   * ==========================================
   */

  loadTodayAttendances(): void {

    this.loadingAttendances = true;


    this.attendanceService
      .getTodayAttendances()
      .subscribe({

        next: response => {

          this.attendances = response;

          this.loadingAttendances = false;

        },


        error: error => {

          console.error(error);

          this.loadingAttendances = false;

          this.errorMessage =
            error?.error?.message ||
            'No fue posible cargar las asistencias.';
        }

      });
  }


  /*
   * ==========================================
   * FILTRO
   * ==========================================
   */

  get filteredAttendances():
    AttendanceAdminResponse[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (!search) {

      return this.attendances;

    }


    return this.attendances.filter(
      attendance =>

        attendance.userName
          .toLowerCase()
          .includes(search)

        ||

        attendance.userEmail
          .toLowerCase()
          .includes(search)
    );
  }


  /*
   * ==========================================
   * TOTAL
   * ==========================================
   */

  get totalAttendances(): number {

    return this.attendances.length;

  }


  /*
   * ==========================================
   * DENTRO DE LA EMPRESA
   * ==========================================
   */

  get insideCompanyCount(): number {

    return this.attendances.filter(
      attendance =>
        attendance.insideCompany
    ).length;

  }


  /*
   * ==========================================
   * FUERA DE LA EMPRESA
   * ==========================================
   */

  get outsideCompanyCount(): number {

    return this.attendances.filter(
      attendance =>
        !attendance.insideCompany
    ).length;

  }


  /*
   * ==========================================
   * GOOGLE MAPS
   * ==========================================
   */

  openGoogleMaps(
    attendance: AttendanceAdminResponse
  ): void {

    const url =
      `https://www.google.com/maps?q=${attendance.latitude},${attendance.longitude}`;


    window.open(
      url,
      '_blank'
    );
  }


  /*
   * ==========================================
   * FORMATEAR HORA
   * ==========================================
   */

  formatTime(
    date: string | null | undefined
  ): string {

    if (!date) {

      return '--';

    }


    return new Date(date)
      .toLocaleTimeString(
        'es-CO',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }


  /*
   * ==========================================
   * RECARGAR
   * ==========================================
   */

  refresh(): void {

    this.loadTodayAttendances();

  }
}