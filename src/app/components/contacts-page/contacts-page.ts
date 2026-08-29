import { Component, OnInit, signal } from '@angular/core';
import { ServicesWhatsapp } from '../../services/services-whatsapp';
import { Contact } from '../../interfaces/Contact';
import { WhatsappEmbudo } from "../whatsapp-embudo/whatsapp-embudo";
import { Topbar } from "../topbar/topbar";
import { Sidebar } from "../sidebar/sidebar";
import { ServicesWebsocket } from '../../services/services-websocket';
import { TokensServices } from '../../services/tokens-services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacts-page',
  imports: [WhatsappEmbudo, Topbar, Sidebar, CommonModule],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.css',
})
export class ContactsPage implements OnInit{

  public contacts = signal<Contact[]>([]);

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  public enviado!: boolean;

  readonly pageSize = 5;

  constructor(private servicesWhat: ServicesWhatsapp, 
    private serviceWebs: ServicesWebsocket,
    private tokensServices: TokensServices){}

  ngOnInit(): void {
    this.loadContacts(0);
    this.serviceWebs.connect();
    this.serviceWebs.contacts$.subscribe(contact => {

      this.updateContactFromWebSocket(contact);

    });
  }

  public meRol(rol: string): boolean{

    const roles = this.tokensServices.getRoles();

    return roles.includes(rol);
  }

  private updateContactFromWebSocket(contact: Contact): void {

    this.contacts.update(list => {

      const exists = list.some(c => c.id === contact.id);

      if (exists) {

        return list.map(c => c.id === contact.id ? contact : c);

      }else{

        this.loadContacts(this.currentPage());
      }

      return [contact, ...list];

    });

  }

  public sendCampaing(): void{

    this.enviado = true;

    this.servicesWhat.sendCampaing().subscribe({
      next: (message) => {
        alert(message);
        this.enviado = false;
      },
      error: () => {
        alert('Error al enviar emails...')
        this.enviado = false;
      }
    });
  }

  public descargarExcel() {

    this.servicesWhat.downloadExcel().subscribe(blob => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'contactos.xlsx';

      a.click();

      window.URL.revokeObjectURL(url);

    });

  }

  public loadContacts(page: number): void {

    this.servicesWhat.getContacts(page).subscribe({

        next: (response) => {

          this.contacts.set(response.content);

          this.currentPage.set(response.number);

          this.totalPages.set(response.totalPages);

          this.totalElements.set(response.totalElements);
        },

        error: (error) => {
          console.error('Error cargando contactos:', error);
        }

      });
  }

  nextPage(): void {

    if (this.currentPage() < this.totalPages() - 1) {

      this.loadContacts(
        this.currentPage() + 1
      );
    }
  }

  previousPage(): void {

    if (this.currentPage() > 0) {

      this.loadContacts(
        this.currentPage() - 1
      );
    }
  }

  goToPage(page: number): void {

    if (
      page >= 0 &&
      page < this.totalPages()
    ) {
      this.loadContacts(page);
    }
  }

  get pageNumbers(): number[] {

    return Array.from(
      { length: this.totalPages() },
      (_, index) => index
    );
  }

}
