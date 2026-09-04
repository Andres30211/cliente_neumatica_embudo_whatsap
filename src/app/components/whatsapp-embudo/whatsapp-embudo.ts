import { ChangeDetectorRef, Component, Input, OnInit, signal } from '@angular/core';
import { ServicesWhatsapp } from '../../services/services-whatsapp';
import { Contact } from '../../interfaces/Contact';
import { CommonModule } from '@angular/common';
import { ServicesWebsocket } from '../../services/services-websocket';
import { BrowserNotificationService } from '../../services/browser-notification-service';

@Component({
  selector: 'whatsapp-embudo',
  imports: [CommonModule],
  templateUrl: './whatsapp-embudo.html',
  styleUrl: './whatsapp-embudo.css',
})
export class WhatsappEmbudo implements OnInit{

  @Input({ required: true })
  contact!: Contact;

  constructor(private servicesWhat: ServicesWhatsapp,
    private browserNotificationService: BrowserNotificationService
  ){}

  ngOnInit(): void {

    this.browserNotificationService.requestPermission();
  }

  /**
   * Descarga un archivo multimedia.
   */
  public downloadMedia(
    messageId: string,
    fileName?: string
  ): void {

    this.servicesWhat
      .getMessageMedia(messageId)
      .subscribe({

        next: (blob) => {

          const url =
            window.URL.createObjectURL(blob);

          const link =
            document.createElement('a');

          link.href = url;

          link.download =
            fileName || 'archivo';

          link.click();

          window.URL.revokeObjectURL(url);
        },

        error: (error) => {

          console.error(
            'Error descargando multimedia:',
            error
          );

          alert(
            'No fue posible descargar el archivo.'
          );
        }

      });
  }

  /**
   * Abre el archivo multimedia
   * en una nueva pestaña.
   */
  public openMedia(
    messageId: string
  ): void {

    this.servicesWhat
      .getMessageMedia(messageId)
      .subscribe({

        next: (blob) => {

          const url =
            window.URL.createObjectURL(blob);

          window.open(
            url,
            '_blank'
          );

        },

        error: (error) => {

          console.error(
            'Error abriendo multimedia:',
            error
          );

          alert(
            'No fue posible abrir el archivo.'
          );
        }

      });
  }

}
