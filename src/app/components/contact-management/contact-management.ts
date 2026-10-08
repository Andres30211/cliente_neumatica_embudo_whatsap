import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Topbar } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';
import { Contact, ContactImportResponse } from '../../interfaces/ContactManagement';
import { ContactManagementService } from '../../services/contact-management-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TokensServices } from '../../services/tokens-services';

@Component({
  selector: 'app-contact-management',
  imports: [Topbar, Sidebar, FormsModule, CommonModule],
  templateUrl: './contact-management.html',
  styleUrl: './contact-management.css',
})
export class ContactManagement implements OnInit{

  contacts: Contact[] = [];

  loading = false;
  importing = false;

  selectedFile: File | null = null;

  searchTerm = '';

  currentPage = 0;
  pageSize = 20;

  totalPages = 0;
  totalElements = 0;

  importResult: ContactImportResponse | null = null;

  errorMessage = '';
  successMessage = '';

  constructor(
    private contactService: ContactManagementService,
    private dc: ChangeDetectorRef,
    private tokensServices: TokensServices
  ) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  /**
   * Verificar ROL
   */
  public meRol(rol: string): boolean{

    const roles = this.tokensServices.getRoles();

    return roles.includes(rol);
  }

  /**
   * Cargar contactos
   */
  loadContacts(): void {

    this.loading = true;
    this.errorMessage = '';

    this.contactService
      .getContacts(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {

          this.contacts = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;

          this.loading = false;
          this.dc.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error cargando contactos:',
            error
          );

          this.errorMessage =
            'No fue posible cargar los contactos.';

          this.loading = false;
        }
      });
  }

  /**
   * Buscar contactos
   */
  get filteredContacts(): Contact[] {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    if (!search) {
      return this.contacts;
    }

    return this.contacts.filter(contact =>
      (contact.name ?? '').toLowerCase().includes(search) ||
      (contact.phone ?? '').toLowerCase().includes(search) ||
      (contact.email ?? '').toLowerCase().includes(search) ||
      (contact.company ?? '').toLowerCase().includes(search)
    );
  }

  /**
   * Seleccionar archivo
   */
  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];

    const extension =
      file.name.split('.').pop()?.toLowerCase();

    if (extension !== 'xlsx') {

      this.errorMessage =
        'Solo se permiten archivos Excel .xlsx';

      this.selectedFile = null;
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.importResult = null;

    this.selectedFile = file;
  }

  /**
   * Importar Excel
   */
  importContacts(): void {

    if (!this.selectedFile) {

      this.errorMessage =
        'Selecciona un archivo Excel antes de importar.';

      return;
    }

    this.importing = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.importResult = null;

    this.contactService
      .importContacts(this.selectedFile)
      .subscribe({

        next: (response) => {

          this.importResult = response;

          this.importing = false;

          this.selectedFile = null;

          this.successMessage =
            'Importación finalizada correctamente.';

          /*
           * Volvemos a la primera página
           * para mostrar los contactos importados.
           */
          this.currentPage = 0;

          this.loadContacts();
        },

        error: (error) => {

          console.error(
            'Error importando contactos:',
            error
          );

          this.importing = false;

          if (error.status === 403) {

            this.errorMessage =
              'No tienes permisos para importar contactos.';

          } else if (error.status === 401) {

            this.errorMessage =
              'Tu sesión ha expirado. Inicia sesión nuevamente.';

          } else {

            this.errorMessage =
              error.error?.message ||
              'Ocurrió un error al importar el archivo.';
          }
        }
      });
  }

  /**
   * Página anterior
   */
  previousPage(): void {

    if (this.currentPage <= 0) {
      return;
    }

    this.currentPage--;

    this.loadContacts();
  }

  /**
   * Página siguiente
   */
  nextPage(): void {

    if (this.currentPage >= this.totalPages - 1) {
      return;
    }

    this.currentPage++;

    this.loadContacts();
  }

  /**
   * Ir a una página específica
   */
  goToPage(page: number): void {

    if (
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;

    this.loadContacts();
  }

  /**
   * Número de páginas para mostrar
   */
  get pages(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index
    );
  }

  /**
   * Estado visual del contacto
   */
  getStatusLabel(contact: Contact): string {

    switch (contact.registrationStep) {

      case 'COMPLETED':
        return 'Completo';

      case 'EMAILANDCOMPANY':
        return 'Pendiente';

      case 'GREETING':
        return 'Inicial';

      default:
        return 'Sin estado';
    }
  }

  /**
   * Clase CSS del estado
   */
  getStatusClass(contact: Contact): string {

    switch (contact.registrationStep) {

      case 'COMPLETED':
        return 'status status--completed';

      case 'EMAILANDCOMPANY':
        return 'status status--pending';

      case 'GREETING':
        return 'status status--initial';

      default:
        return 'status status--unknown';
    }
  }

  /**
   * Formatear fecha
   */
  formatDate(date: string | null): string {

    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }

  /**
   * Formatear fecha y hora
   */
  formatDateTime(date: string | null): string {

    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }

  /**
   * Nombre visual
   */
  getContactName(contact: Contact): string {

    return contact.name?.trim()
      || 'Sin nombre';
  }
}
