import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Contact } from '../interfaces/Contact';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServicesWebsocket {
  
  private client!: Client;

  // Subject privado
  private contactsSubject = new Subject<Contact>();

  // Observable público
  public contacts$ = this.contactsSubject.asObservable();

  connect() {

    this.client = new Client({
      brokerURL: 'wss://neumatica-embudo-whatsap.onrender.com/wss',
      reconnectDelay: 5000
    });

    this.client.onConnect = () => {

      console.log('Conectado al WebSocket');

      this.client.subscribe('/topic/contacts', message => {

        const contact: Contact = JSON.parse(message.body);

        console.log(contact);

        // Emitir el nuevo contacto
        this.contactsSubject.next(contact);

      });

    };

    this.client.activate();
  }

  

}
