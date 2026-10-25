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
  RecordOutRequest,
  VisitResponse,
  VisitService
} from '../../services/visit-services';
import { TokensServices } from '../../services/tokens-services';
import { Observable } from 'rxjs';
import { NotificationServices } from '../../services/notification-services';

type VisitRecordProgressStep = | 'idle' | 'location' | 'saving';

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

  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  imageUrls: Record<string, string> = {};

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

  loadingRecordVisit = false;

  loadingOutVisit = false;

  loadingVisits = true;

  loadingMyVisits = true;

  visitRecordProgressStep: VisitRecordProgressStep = 'idle';

  processOutId: string | null = null;

  stateOut: 'gps' | 'saving' | null = null;

  /*
   * =========================================================
   * VISITAS
   * =========================================================
   */

  visits: VisitResponse[] = [];

  Myvisits: VisitResponse[] = [];

  public openMenuVisitId: string | null = null;

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
    private tokensServices: TokensServices,
    private notificationServices: NotificationServices
  ) {

    /*
     * Formulario reactivo.
     */

    this.visitForm = this.fb.group({

      companyName: ['', [Validators.required, Validators.maxLength(200)]],
      comment: ['', [Validators.required, Validators.maxLength(5000)]],
      searchTerm: ['']
    });

  }

  /*
   * =========================================================
   * INIT
   * =========================================================
   */

  ngOnInit(): void {
    if (this.meRol('ROLE_ADMIN')) {
      this.loadVisits();
    } else {
      this.loadMiVisits();
    }
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

  public onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    // Limpiar la selección anterior antes de validar la nueva.
    this.removeImage();

    // Validar formato.
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.notificationServices.error(
        'Error de imagen',
        'Selecciona una imagen JPG, PNG o WebP.'
      );

      input.value = '';
      return;
    }

    // Validar tamaño antes de compresión.
    if (file.size > this.MAX_IMAGE_SIZE) {
      this.notificationServices.error(
        'Error de imagen',
        'La imagen no puede superar 5 MB.'
      );

      input.value = '';
      return;
    }

    // Conservar el archivo original para el envío.
    this.selectedImage = file;

    // Generar la vista previa local.
    this.imagePreview = URL.createObjectURL(file);
  }

  /*
   * =========================================================
   * ELIMINAR IMAGEN
   * =========================================================
   */

  removeImage(): void {

    this.selectedImage = undefined;

    this.imagePreview = null;

    /*
     * Limpiar input de archivo.
     */

    const input = document.getElementById('imageInput') as HTMLInputElement | null;

    if (input) {

      input.value = '';

    }

  }

  /*
   * =========================================================
   * REGISTRAR VISITA
   * =========================================================
   */

  get progressMessage(): string {
    switch (this.visitRecordProgressStep) {
      case 'location':
        return 'Obteniendo ubicación GPS...';

      case 'saving':
        return 'Enviando fotografía y guardando visita...';

      default:
        return 'Preparando registro.';
    }
  }

  registerVisit(): void {

    /*
    * Validar formulario.
    */

    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();

      return;

    }

    /*
     * Validar imagen.
     */

    if (!this.selectedImage) {

      this.notificationServices.error('Error Imagen', 'Debes subir una fotografía.');

      return;

    }

    /*
     * Evitar doble envío.
     */

    if (this.loadingRecordVisit) {

      return;

    }

    this.loadingRecordVisit = true;

    this.visitRecordProgressStep = 'location';

    /*
    * =======================================================
     * GPS
     * =======================================================
     */

    if (!navigator.geolocation) {

      this.loadingRecordVisit = false;

      this.notificationServices.error('Error geolocalización', 'Tu dispositivo no soporta geolocalización.');

      return;

    }


    navigator.geolocation.getCurrentPosition(

      position => {

        /*
        * Guardar coordenadas.
        */

        this.latitude = position.coords.latitude;

        this.longitude = position.coords.longitude;

        this.accuracy = position.coords.accuracy;

        this.visitRecordProgressStep = 'saving';

        /*
         * Crear FormData.
         */

        const formData = new FormData();

        /*
         * Datos del formulario.
         */

        formData.append('companyName', this.companyName?.value.trim());

        formData.append('comment', this.comment?.value.trim());

        /*
         * GPS.
         */

        formData.append('latitude', this.latitude.toString());

        formData.append('longitude', this.longitude.toString());

        formData.append('accuracy', this.accuracy.toString());

        /*
         * Imagen.
         */

        formData.append('image', this.selectedImage!, this.selectedImage!.name);

        /*
         * ===================================================
         * ENVIAR AL BACKEND
         * ===================================================
         */

        this.visitService.createVisit(formData).subscribe({

          next: (response) => {
            this.loadingRecordVisit = false;
            this.visitRecordProgressStep = 'idle';

            if (this.meRol('ROLE_ADMIN')) {
              this.visits = [response, ...this.visits];
            } else {
              this.Myvisits = [response, ...this.Myvisits];
            }

            this.getImageUrl(response);

            this.notificationServices.success('Visita', 'Visita registrada correctamente.');

            this.resetForm();

            this.dc.markForCheck();
          },
          error: error => {
            
            this.loadingRecordVisit = false;
            this.visitRecordProgressStep = 'idle';
            this.dc.markForCheck();
            
            this.notificationServices.error('Error registrando visita:', error);
            
            if (error?.status === 413) {
              
              this.notificationServices.error('Error Imagen:',
                'La imagen es demasiado grande para el servidor.');
                
                return;
                
              }
              
              this.notificationServices.error('Visita', error);
              
            }
            
          });
          
        },
        error => {
          
          this.loadingRecordVisit = false;
          this.visitRecordProgressStep = 'idle';
          this.dc.markForCheck();

        switch (error.code) {

          case error.PERMISSION_DENIED:

            this.notificationServices.error('Ubicación',
              'Debes permitir el acceso a tu ubicación.');

            break;


          case error.POSITION_UNAVAILABLE:

            this.notificationServices.error('Ubicación',
              'No fue posible obtener tu ubicación.');

            break;


          case error.TIMEOUT:

            this.notificationServices.error('Ubicación',
              'No fue posible obtener tu ubicación a tiempo.');

            break;


          default:

            this.notificationServices.error('Ubicación',
              'Ocurrió un error obteniendo tu ubicación.');

        }

      },

      {

        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 0

      }

    );

  }

  recordOut(visitaId: string): void {

    if (this.processOutId !== null) {
      return;
    }

    if (!navigator.geolocation) {
      this.notificationServices.error('GPS', 'El dispositivo no permite obtener GPS.');
      return;
    }

    this.loadingOutVisit = true;
    this.processOutId = visitaId;
    this.stateOut = 'gps';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const ubicacion: RecordOutRequest = {
          departureLatitude: position.coords.latitude,
          departureLongitude: position.coords.longitude,
          precisionGpsOutput: position.coords.accuracy
        };

        this.stateOut = 'saving';

        this.visitService.recordOut(visitaId, ubicacion).subscribe({
          next: (response: VisitResponse) => {

            // Actualiza el listado o recarga la visita.
            if (this.meRol('ROLE_ADMIN')) {
              this.visits = this.visits.map(visit =>
                visit.id === response.id ? response : visit);
            } else {
              this.Myvisits = this.Myvisits.map(myVisit =>
                myVisit.id === response.id ? response : myVisit);
            }

            this.processOutId = null;
            this.stateOut = null;
            this.loadingOutVisit = false;

            this.dc.markForCheck();
            this.notificationServices.success('Registro salida', 'Salida registrada correctamente.');
            this.toggleVisitMenuById(response.id);
          },
          error: (error) => {
            this.processOutId = null;
            this.stateOut = null;
            this.loadingOutVisit = false;
            this.dc.markForCheck();
            this.notificationServices.error('Registro salida', error);
          }
        });
      },
      (error) => {
        this.loadingOutVisit = false;
        this.processOutId = null;
        this.stateOut = null;
        this.dc.markForCheck();

        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.notificationServices.error('GPS',
              'Debes permitir el acceso a la ubicación para registrar la salida.');
            break;
          case error.POSITION_UNAVAILABLE:
            this.notificationServices.error('GPS', 'No se pudo determinar tu ubicación.');
            break;
          case error.TIMEOUT:
            this.notificationServices.error('GPS', 'La ubicación tardó demasiado. Inténtalo nuevamente.');
            break;
          default:
            this.notificationServices.error('GPS', 'No fue posible obtener la ubicación.');
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

  public loadMiVisits(): void {
    this.loadingMyVisits = true;

    this.visitService.getMyVisits().subscribe({
      next: (response: VisitResponse[]) => {
        this.Myvisits = response;
        this.loadVisitImages(response);
        this.loadingMyVisits = false;
        this.dc.markForCheck();
      },
      error: (error) => {
        this.loadingMyVisits = false;
        console.error('Error al cargar mis visitas:', error);
        this.notificationServices.error(
          'Error de visitas',
          'No fue posible cargar tus visitas.'
        );
      }
    });
  }

  public loadVisits(): void {
    this.loadingVisits = true;

    this.visitService.getAllVisits().subscribe({
      next: (response: VisitResponse[]) => {
        this.visits = response;
        this.loadVisitImages(response);
        this.loadingVisits = false;
        this.dc.markForCheck();
      },
      error: (error) => {
        this.loadingVisits = false;
        console.error('Error al cargar todas las visitas:', error);
        this.notificationServices.error(
          'Error de visitas',
          'No fue posible cargar todas las visitas.'
        );
      }
    });
  }

  private loadVisitImages(visits: VisitResponse[]): void {
    for (const visit of visits) {
      if (!visit.imageUrl || this.imageUrls[visit.imageUrl]) {
        continue;
      }

      this.getImageUrl(visit);
    }
  }

  getImageUrl(visit: VisitResponse): void {
    const imageKey = visit.imageUrl;

    if (!imageKey || this.imageUrls[imageKey]) {
      return;
    }

    this.visitService.getImageUrl(imageKey).subscribe({
      next: (image: Blob) => {
        // Solo aceptar una respuesta de imagen.
        if (!image.type.startsWith('image/')) {
          this.imageUrls[imageKey] = 'error.jpg';
          return;
        }

        this.imageUrls[imageKey] = URL.createObjectURL(image);
        this.dc.markForCheck();
      },
      error: (err) => {
        // Una imagen inexistente no debe impedir cargar las visitas.
        console.warn(
          `No se pudo cargar la imagen de la visita ${visit.id}:`,
          err.status
        );

        this.imageUrls[imageKey] = 'error.jpg';
      }
    });
  }

  public onImageError(imageKey: string, event: Event): void {

    const img = event.target as HTMLImageElement;

    // Evita bucles si también falla la imagen de sustitución.
    img.onerror = null;
    img.src = 'error.jpg';
  }


  /*
   * =========================================================
   * VISITAS FILTRADAS
   * =========================================================
   */

  get filteredVisits(): VisitResponse[] {

    const search = (this.searchTerm?.value || '').trim().toLowerCase();

    if (!search) {

      return this.visits;

    }

    return this.visits.filter(visit => visit.companyName.toLowerCase().includes(search) || visit.userName
      .toLowerCase()
      .includes(search)

    );

  }

  get MyfilteredVisits(): VisitResponse[] {

    const search = (this.searchTerm?.value || '').trim().toLowerCase();

    if (!search) {

      return this.Myvisits;

    }

    return this.Myvisits.filter(Myvisits => Myvisits.companyName.toLowerCase().includes(search) || Myvisits.userName
      .toLowerCase()
      .includes(search)

    );

  }

  /*
   * =========================================================
   * GOOGLE MAPS
   * =========================================================
   */

  openGoogleMapsArrival(visit: VisitResponse): void {

    const url = `https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`;

    window.open(url, '_blank');

  }

  openGoogleMapsExit(visit: VisitResponse): void {

    const url = `https://www.google.com/maps?q=${visit.departureLatitude},${visit.departureLongitude}`;

    window.open(url, '_blank');

  }


  /*
   * =========================================================
   * FORMATEAR FECHA
   * =========================================================
   */

  formatDate(date: string): string {

    return new Date(date).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

  }

  visitOutHour(visit: VisitResponse): string {

    const arrival = new Date(visit.visitedAt).getTime();
    const departure = new Date(visit.departureDateTime).getTime();

    if (isNaN(arrival) || isNaN(departure) || departure < arrival) {
      return 'Salida pendiente';
    }

    return this.formatDate(visit.departureDateTime);
  }

  visitDuration(visit: VisitResponse): string {
    const arrival = new Date(visit.visitedAt).getTime();
    const departure = new Date(visit.departureDateTime).getTime();

    if (isNaN(arrival) || isNaN(departure) || departure < arrival) {
      return 'Duración no disponible';
    }

    const totalMinutes = Math.floor((departure - arrival) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
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
    if (this.meRol('ROLE_ADMIN')) {

      this.loadVisits();
    } else {

      this.loadMiVisits();
    }

  }

  public meRol(rol: string): boolean {

    const roles = this.tokensServices.getRoles();

    return roles.includes(rol);
  }

  public getVisitDeleteInfo(visitId: string): void {

    this.visitService.getVisitDeleteInfo(visitId).subscribe({
      next: (visit: VisitResponse) => {

        this.notificationServices.confirm('Eliminar Visita.',
          `Eliminará la visita de:
           Usuario: ${visit.userName}
           Empresa: ${visit.companyName}
           Fecha: ${this.formatDate(visit.createdAt)}`)

          .then((result) => {
            if (result.isConfirmed) {
              this.visitService.deleteVisit(visitId).subscribe({
                next: () => {
                  this.notificationServices.success('Visita eliminada.',
                    'La visita se elimino Correctamente');

                  if (this.meRol('ROLE_ADMIN')) {

                    this.visits = this.visits.filter(item => item.id !== visitId);
                  } else {

                    this.Myvisits = this.Myvisits.filter(item => item.id !== visitId);
                  }

                  this.dc.markForCheck();

                },
                error: (err) => {
                  this.notificationServices.error('ERROR', err);
                }
              });
            }


          });
      },
      error: (err) => {
        this.notificationServices.error('ERROR', err);
      },
    });
  }

  public toggleVisitMenu(visitId: string, event: MouseEvent): void {

    event.stopPropagation();

    this.openMenuVisitId = this.openMenuVisitId === visitId ? null : visitId;
  }

  private toggleVisitMenuById(visitId: string): void {

    this.openMenuVisitId = this.openMenuVisitId === visitId ? null : visitId;
  }

  public deleteVisitFromMenu(visitId: string): void {
    this.openMenuVisitId = null;

    this.getVisitDeleteInfo(visitId);
  }

}