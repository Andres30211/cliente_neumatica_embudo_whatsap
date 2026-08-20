import { Component, OnInit, signal } from '@angular/core';
import { ServicesWhatsapp } from '../../services/services-whatsapp';
import { Contact } from '../../interfaces/Contact';
import { WhatsappEmbudo } from "../whatsapp-embudo/whatsapp-embudo";
import { Topbar } from "../topbar/topbar";
import { Sidebar } from "../sidebar/sidebar";
import { ServicesWebsocket } from '../../services/services-websocket';

@Component({
  selector: 'app-contacts-page',
  imports: [WhatsappEmbudo, Topbar, Sidebar],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.css',
})
export class ContactsPage implements OnInit{

  public contacts = signal<Contact[]>([]);

  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

  readonly pageSize = 5;

  constructor(private servicesWhat: ServicesWhatsapp, private serviceWebs: ServicesWebsocket){}

  ngOnInit(): void {
    this.loadContacts(0);
    this.serviceWebs.connect();
    this.serviceWebs.contacts$.subscribe(contact => {

      this.updateContactFromWebSocket(contact);

    });
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
