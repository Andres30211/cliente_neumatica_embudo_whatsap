import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import { Topbar } from '../topbar/topbar';

import { Sidebar } from '../sidebar/sidebar';
import { VisitResponse, VisitServices } from '../../services/visit-services';


@Component({
  selector: 'app-visit',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Topbar,
    Sidebar
  ],

  templateUrl: './visit.html',

  styleUrl: './visit.css'
})
export class Visit implements OnInit {


  /*
   * =========================================================
   * FORMULARIO
   * =========================================================
   */

  companyName = '';

  comment = '';

  selectedImage?: File;

  imagePreview: string | null = null;


  /*
   * =========================================================
   * GPS
   * =========================================================
   */

  latitude?: number;

  longitude?: number;

  accuracy?: number;


  /*
   * =========================================================
   * ESTADOS
   * =========================================================
   */

  loading = false;

  loadingVisits = false;

  message = '';

  errorMessage = '';


  /*
   * =========================================================
   * VISITAS
   * =========================================================
   */

  visits: VisitResponse[] = [];


  /*
   * =========================================================
   * MODAL
   * =========================================================
   */

  selectedVisit?: VisitResponse;

  showModal = false;


  /*
   * =========================================================
   * BUSQUEDA
   * =========================================================
   */

  searchTerm = '';


  constructor(
    private visitService: VisitServices
  ) {}


  ngOnInit(): void {

    this.loadVisits();

  }


  /*
   * =========================================================
   * SELECCIONAR IMAGEN
   * =========================================================
   */

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    /*
     * Validar tipo.
     */
    if (!file.type.startsWith('image/')) {

      this.errorMessage =
        'Selecciona una imagen válida.';

      return;
    }


    /*
     * Máximo 5 MB.
     */
    if (
      file.size >
      5 * 1024 * 1024
    ) {

      this.errorMessage =
        'La imagen no puede superar 5 MB.';

      return;
    }


    this.selectedImage = file;


    /*
     * Preview.
     */
    const reader =
      new FileReader();


    reader.onload =
      () => {

        this.imagePreview =
          reader.result as string;

      };


    reader.readAsDataURL(file);

  }


  /*
   * =========================================================
   * ELIMINAR IMAGEN
   * =========================================================
   */

  removeImage(): void {

    this.selectedImage =
      undefined;

    this.imagePreview =
      null;

  }


  /*
   * =========================================================
   * REGISTRAR VISITA
   * =========================================================
   */

  registerVisit(): void {

    this.message = '';

    this.errorMessage = '';


    /*
     * Validaciones.
     */
    if (!this.companyName.trim()) {

      this.errorMessage =
        'Ingresa el nombre de la empresa.';

      return;
    }


    if (!this.comment.trim()) {

      this.errorMessage =
        'Ingresa un comentario.';

      return;
    }


    if (!this.selectedImage) {

      this.errorMessage =
        'Debes subir una fotografía.';

      return;
    }


    this.loading = true;


    /*
     * Obtener GPS en tiempo real.
     */
    if (!navigator.geolocation) {

      this.loading = false;

      this.errorMessage =
        'Tu dispositivo no soporta geolocalización.';

      return;
    }


    navigator.geolocation.getCurrentPosition(

      position => {

        this.latitude =
          position.coords.latitude;

        this.longitude =
          position.coords.longitude;

        this.accuracy =
          position.coords.accuracy;


        /*
         * Crear request.
         */
        const request = {

          companyName:
            this.companyName.trim(),

          comment:
            this.comment.trim(),

          latitude:
            this.latitude,

          longitude:
            this.longitude,

          accuracy:
            this.accuracy

        };


        /*
         * Enviar.
         */
        this.visitService
          .createVisit(
            request,
            this.selectedImage!
          )
          .subscribe({

            next: response => {

              this.loading = false;


              this.message =
                'Visita registrada correctamente.';


              /*
               * Limpiar formulario.
               */
              this.resetForm();


              /*
               * Actualizar visitas.
               */
              this.loadVisits();

            },


            error: error => {

              this.loading = false;

              console.error(error);


              this.errorMessage =
                error?.error?.message ||
                'No fue posible registrar la visita.';

            }

          });

      },


      error => {

        this.loading = false;


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
              'No fue posible obtener tu ubicación a tiempo.';

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
   * =========================================================
   * CARGAR VISITAS
   * =========================================================
   */

  loadVisits(): void {

    this.loadingVisits = true;


    this.visitService
      .getAllVisits()
      .subscribe({

        next: response => {

          this.visits =
            response;

          this.loadingVisits =
            false;

        },


        error: error => {

          this.loadingVisits =
            false;

          console.error(error);

        }

      });

  }


  /*
   * =========================================================
   * VISITAS FILTRADAS
   * =========================================================
   */

  get filteredVisits():
    VisitResponse[] {

    const search =
      this.searchTerm
        .trim()
        .toLowerCase();


    if (!search) {

      return this.visits;

    }


    return this.visits.filter(
      visit =>

        visit.companyName
          .toLowerCase()
          .includes(search)

        ||

        visit.userName
          .toLowerCase()
          .includes(search)

    );

  }


  /*
   * =========================================================
   * ABRIR MODAL
   * =========================================================
   */

  openVisit(
    visit: VisitResponse
  ): void {

    this.selectedVisit =
      visit;

    this.showModal =
      true;

  }


  /*
   * =========================================================
   * CERRAR MODAL
   * =========================================================
   */

  closeModal(): void {

    this.showModal =
      false;

    this.selectedVisit =
      undefined;

  }


  /*
   * =========================================================
   * GOOGLE MAPS
   * =========================================================
   */

  openGoogleMaps(
    visit: VisitResponse
  ): void {

    const url =
      `https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`;


    window.open(
      url,
      '_blank'
    );

  }


  /*
   * =========================================================
   * FORMATEAR FECHA
   * =========================================================
   */

  formatDate(
    date: string
  ): string {

    return new Date(date)
      .toLocaleString(
        'es-CO',
        {
          dateStyle: 'medium',
          timeStyle: 'short'
        }
      );

  }


  /*
   * =========================================================
   * RESET
   * =========================================================
   */

  resetForm(): void {

    this.companyName = '';

    this.comment = '';

    this.selectedImage =
      undefined;

    this.imagePreview =
      null;

    this.latitude =
      undefined;

    this.longitude =
      undefined;

    this.accuracy =
      undefined;

  }


  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  refresh(): void {

    this.loadVisits();

  }

}