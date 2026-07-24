import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ServicesWhatsapp } from '../../services/services-whatsapp';
import { Contact } from '../../interfaces/Contact';
import { CommonModule } from '@angular/common';
import { ServicesWebsocket } from '../../services/services-websocket';

@Component({
  selector: 'whatsapp-embudo',
  imports: [CommonModule],
  templateUrl: './whatsapp-embudo.html',
  styleUrl: './whatsapp-embudo.css',
})
export class WhatsappEmbudo implements OnInit{

  public enviado!: boolean;

  public contacts = signal<Contact[]>([]);

  constructor(private servicesWhat: ServicesWhatsapp,
      private serviceWebs: ServicesWebsocket){}

  ngOnInit(): void {
    this.getContacts();
    this.serviceWebs.connect();
    this.serviceWebs.contacts$.subscribe(contact => {

      this.contacts.update(list => {

        const filtered = list.filter(c => c.id !== contact.id);

        return [contact, ...filtered];

      });

    });
  }

  public getContacts():any{
    this.servicesWhat.getContacts().subscribe({
      next: (cont:Contact[]) => {
        console.log(cont);
        this.contacts.set(cont);
      }
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

  descargarExcel() {

    this.servicesWhat.downloadExcel().subscribe(blob => {

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = 'contactos.xlsx';

      a.click();

      window.URL.revokeObjectURL(url);

    });

  }
}
