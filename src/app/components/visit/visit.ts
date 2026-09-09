import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Topbar
} from '../topbar/topbar';

import {
  Sidebar
} from '../sidebar/sidebar';

import {
  VisitResponse,
  VisitService
} from '../../services/visit-services';
import { TokensServices } from '../../services/tokens-services';


@Component({
  selector: 'app-visit',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    Topbar,
    Sidebar
  ],

  templateUrl: './visit.html',

  styleUrl: './visit.css'
})
export class Visit implements OnInit {


  /*
   * =========================================================
   * FORMULARIO REACTIVO
   * =========================================================
   */

  visitForm: FormGroup;


  /*
   * =========================================================
   * IMAGEN
   * =========================================================
   */

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

  loadingVisits = true;

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
   * CONSTRUCTOR
   * =========================================================
   */

  constructor(
    private fb: FormBuilder,
    private visitService: VisitService,
    private dc: ChangeDetectorRef,
    private tokensServices: TokensServices
  ) {

    /*
     * Formulario reactivo.
     */

    this.visitForm =
      this.fb.group({

        companyName: [
          '',
          [
            Validators.required,
            Validators.maxLength(200)
          ]
        ],

        comment: [
          '',
          [
            Validators.required,
            Validators.maxLength(5000)
          ]
        ],

        searchTerm: [
          ''
        ]

      });

  }


  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  ngOnInit(): void {

    this.loadVisits();

  }


  /*
   * =========================================================
   * GETTERS DEL FORMULARIO
   * =========================================================
   */

  get companyName() {
    return this.visitForm.get('companyName');
  }


  get comment() {
    return this.visitForm.get('comment');
  }


  get searchTerm() {
    return this.visitForm.get('searchTerm');
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

      input.value = '';

      return;

    }


    /*
     * Máximo 5 MB antes de compresión.
     */

    if (
      file.size >
      5 * 1024 * 1024
    ) {

      this.errorMessage =
        'La imagen no puede superar 5 MB.';

      input.value = '';

      return;

    }


    /*
     * Limpiar error.
     */

    this.errorMessage = '';


    /*
     * Guardar archivo.
     */

    this.selectedImage =
      file;


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


    reader.onerror =
      () => {

        this.errorMessage =
          'No fue posible mostrar la imagen.';

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


    /*
     * Limpiar input de archivo.
     */

    const input =
      document.getElementById(
        'imageInput'
      ) as HTMLInputElement | null;


    if (input) {

      input.value = '';

    }

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
     * Marcar campos como tocados.
     */

    this.visitForm.markAllAsTouched();


    /*
     * Validar formulario.
     */

    if (
      this.visitForm.invalid
    ) {

      this.errorMessage =
        'Completa correctamente los campos obligatorios.';

      return;

    }


    /*
     * Validar imagen.
     */

    if (!this.selectedImage) {

      this.errorMessage =
        'Debes subir una fotografía.';

      return;

    }


    /*
     * Evitar doble envío.
     */

    if (this.loading) {

      return;

    }


    this.loading = true;


    /*
     * =======================================================
     * GPS
     * =======================================================
     */

    if (!navigator.geolocation) {

      this.loading = false;

      this.errorMessage =
        'Tu dispositivo no soporta geolocalización.';

      return;

    }


    navigator.geolocation.getCurrentPosition(

      position => {

        /*
         * Guardar coordenadas.
         */

        this.latitude =
          position.coords.latitude;

        this.longitude =
          position.coords.longitude;

        this.accuracy =
          position.coords.accuracy;


        /*
         * Crear FormData.
         */

        const formData =
          new FormData();


        /*
         * Datos del formulario.
         */

        formData.append(
          'companyName',
          this.companyName?.value.trim()
        );


        formData.append(
          'comment',
          this.comment?.value.trim()
        );


        /*
         * GPS.
         */

        formData.append(
          'latitude',
          this.latitude.toString()
        );


        formData.append(
          'longitude',
          this.longitude.toString()
        );


        formData.append(
          'accuracy',
          this.accuracy.toString()
        );


        /*
         * Imagen.
         */

        formData.append(
          'image',
          this.selectedImage!,
          this.selectedImage!.name
        );


        /*
         * ===================================================
         * ENVIAR AL BACKEND
         * ===================================================
         */

        this.visitService
          .createVisit(formData)
          .subscribe({

            next: response => {

              console.log(
                'Visita creada:',
                response
              );


              this.loading = false;


              this.message =
                'Visita registrada correctamente.';


              /*
               * Limpiar formulario.
               */

              this.resetForm();


              /*
               * Actualizar historial.
               */

              this.loadVisits();

            },


            error: error => {

              this.loading = false;


              console.error(
                'Error registrando visita:',
                error
              );


              if (
                error?.status === 413
              ) {

                this.errorMessage =
                  'La imagen es demasiado grande para el servidor.';

                return;

              }


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

          this.loadingVisits = false;

          this.dc.detectChanges();

        },


        error: error => {

          this.loadingVisits =
            false;

          console.error(
            'Error cargando visitas:',
            error
          );

        }

      });

  }

  getImageUrl(imageUrl: string): string {

    return this.visitService.getImageUrl(imageUrl);
  }


  /*
   * =========================================================
   * VISITAS FILTRADAS
   * =========================================================
   */

  get filteredVisits():
    VisitResponse[] {

    const search =
      (
        this.searchTerm?.value ||
        ''
      )
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

    this.visitForm.reset({

      companyName: '',

      comment: '',

      searchTerm:
        this.searchTerm?.value || ''

    });


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


    /*
     * Limpiar input file.
     */

    const input =
      document.getElementById(
        'imageInput'
      ) as HTMLInputElement | null;


    if (input) {

      input.value = '';

    }

  }


  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  refresh(): void {

    this.loadVisits();

  }

  public meRol(rol: string): boolean{

    const roles = this.tokensServices.getRoles();

    return roles.includes(rol);
  }

}