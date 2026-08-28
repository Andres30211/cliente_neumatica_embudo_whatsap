import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Subject } from 'rxjs';

import { Contact } from '../interfaces/Contact';
import { Notification } from '../interfaces/Notification';
import { NotificationServices } from './notification-services';

@Injectable({
  providedIn: 'root',
})
export class ServicesWebsocket {

  private client!: Client;

  // =========================
  // CONTACTOS
  // =========================

  private contactsSubject = new Subject<Contact>();

  public contacts$ = this.contactsSubject.asObservable();


  // =========================
  // NOTIFICACIONES
  // =========================

  // private notificationsSubject = new Subject<Notification>();

  // public notifications$ = this.notificationsSubject.asObservable();

  constructor(private notificationService: NotificationServices){}


  // =========================
  // CONEXIÓN
  // =========================

  connect(): void {

    this.client = new Client({
      brokerURL: 'wss://neumatica-embudo-whatsap.onrender.com/wss',
      reconnectDelay: 5000
    });

    this.client.onConnect = () => {

      console.log('Conectado al WebSocket');


      // -------------------------
      // CONTACTOS
      // -------------------------

      this.client.subscribe('/topic/contacts', message => {

        const contact: Contact = JSON.parse(message.body);

        this.contactsSubject.next(contact);

      });


      // -------------------------
      // NOTIFICACIONES
      // -------------------------

      this.client.subscribe('/topic/notifications', message => {

        const notification: Notification =
          JSON.parse(message.body);

          this.notificationService.addNotification(notification);
        // this.notificationsSubject.next(notification);

      });

    };

    this.client.activate();
  }
}