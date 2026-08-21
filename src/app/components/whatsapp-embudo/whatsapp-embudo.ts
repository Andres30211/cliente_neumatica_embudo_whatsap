import { ChangeDetectorRef, Component, Input, OnInit, signal } from '@angular/core';
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

  @Input({ required: true })
  contact!: Contact;

  constructor(private servicesWhat: ServicesWhatsapp){}

  ngOnInit(): void {
  }

}
