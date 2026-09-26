import { Injectable } from '@angular/core';

import {
  Client,
  IMessage,
  StompSubscription
} from '@stomp/stompjs';

import {
  Observable,
  Subject
} from 'rxjs';

import { Contact } from '../interfaces/Contact';

import { Notification } from '../interfaces/Notification';

import { ConversationSummaryResponse }
  from '../interfaces/ConversationSummaryResponse';

import { NotificationServices }
  from './notification-services';


/**
 * ============================================================
 * SERVICIO WEBSOCKET
 * ============================================================
 *
 * Servicio centralizado para la comunicación en tiempo real
 * mediante WebSocket / STOMP.
 *
 * Canales manejados:
 *
 * 1. /topic/contacts
 *      Compatibilidad con funcionalidades existentes.
 *
 * 2. /topic/notifications
 *      Notificaciones generales del CRM.
 *
 * 3. /topic/conversations
 *      Actualizaciones de la lista compacta de conversaciones.
 *
 * 4. /topic/conversations/{conversationId}
 *      Mensajes en tiempo real de una conversación específica.
 */
@Injectable({
  providedIn: 'root',
})
export class ServicesWebsocket {


  // =========================================================
  // CLIENTE STOMP
  // =========================================================

  private client!: Client;


  /**
   * Indica si actualmente existe una conexión activa.
   */
  private connected = false;


  // =========================================================
  // CONTACTOS
  // =========================================================

  /**
   * Se mantiene porque /topic/contacts continúa enviando
   * objetos Contact desde Spring.
   */
  private contactsSubject =
    new Subject<Contact>();


  public contacts$ =
    this.contactsSubject.asObservable();


  // =========================================================
  // NOTIFICACIONES
  // =========================================================

  private notificationsSubject =
    new Subject<Notification>();


  public notifications$ =
    this.notificationsSubject.asObservable();


  // =========================================================
  // RESÚMENES DE CONVERSACIONES
  // =========================================================

  /**
   * Recibe las actualizaciones de:
   *
   * /topic/conversations
   *
   * Este canal alimenta la lista compacta del CRM.
   */
  private conversationSummariesSubject =
    new Subject<ConversationSummaryResponse>();


  public conversationSummaries$ =
    this.conversationSummariesSubject.asObservable();


  /**
   * Suscripción STOMP del canal global de conversaciones.
   */
  private conversationSummariesSubscription:
    StompSubscription | null = null;


  // =========================================================
  // MENSAJES DE CONVERSACIONES
  // =========================================================

  /**
   * Cada conversación tiene su propio Subject.
   *
   * conversationId
   *      ↓
   * Subject<any>
   */
  private conversationSubjects =
    new Map<string, Subject<any>>();


  /**
   * Suscripciones STOMP de cada conversación.
   *
   * conversationId
   *      ↓
   * StompSubscription
   */
  private conversationSubscriptions =
    new Map<
      string,
      StompSubscription
    >();


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private notificationService:
      NotificationServices
  ) {}


  // =========================================================
  // CONEXIÓN
  // =========================================================

  connect(): void {

    /*
     * Si ya estamos conectados, no hacemos nada.
     */
    if (this.connected) {

      console.log(
        'WebSocket ya está conectado.'
      );

      return;
    }


    /*
     * Si existe un cliente activo, tampoco
     * creamos otro.
     */
    if (
      this.client &&
      this.client.active
    ) {

      return;
    }


    console.log(
      'Intentando conectar WebSocket...'
    );


    this.client =
      new Client({

        brokerURL: 'wss://neumatica-embudo-whatsap.onrender.com/wss',
          // 'wss://neumatica-embudo-whatsap.onrender.com/wss'

        /*
         * STOMP intentará reconectar automáticamente
         * si la conexión se pierde.
         */
        reconnectDelay: 5000,

        debug: (
          message: string
        ) => {

          console.log(
            '[STOMP]',
            message
          );

        }

      });


    // =======================================================
    // CONEXIÓN EXITOSA
    // =======================================================

    this.client.onConnect = () => {

      console.log(
        'Conectado al WebSocket'
      );


      this.connected = true;


      // -----------------------------------------------------
      // CONTACTOS
      // -----------------------------------------------------

      this.subscribeToContacts();


      // -----------------------------------------------------
      // NOTIFICACIONES
      // -----------------------------------------------------

      this.subscribeToNotifications();


      // -----------------------------------------------------
      // RESÚMENES DE CONVERSACIONES
      // -----------------------------------------------------

      this.subscribeToConversationSummaries();


      // -----------------------------------------------------
      // CONVERSACIONES INDIVIDUALES
      // -----------------------------------------------------

      /*
       * Después de una reconexión las suscripciones STOMP
       * anteriores dejan de existir.
       *
       * Los Subjects se mantienen, por lo que reconstruimos
       * las suscripciones de todas las conversaciones activas.
       */
      this.conversationSubjects
        .forEach(
          (
            _subject,
            conversationId
          ) => {

            this.createConversationSubscription(
              conversationId
            );

          }
        );

    };


    // =======================================================
    // DESCONEXIÓN
    // =======================================================

    this.client.onDisconnect = () => {

      console.log(
        'WebSocket desconectado.'
      );

      this.connected = false;

      /*
       * Las suscripciones STOMP ya no son válidas.
       *
       * Los Subjects se conservan para poder reconstruir
       * las suscripciones cuando STOMP vuelva a conectar.
       */
      this.conversationSubscriptions
        .clear();

      this.conversationSummariesSubscription =
        null;
    };


    // =======================================================
    // ERROR STOMP
    // =======================================================

    this.client.onStompError = (
      frame
    ) => {

      console.error(
        'Error STOMP:',
        frame.headers['message']
      );

      console.error(
        'Detalles:',
        frame.body
      );

    };


    // =======================================================
    // ERROR WEBSOCKET
    // =======================================================

    this.client.onWebSocketError = (
      error
    ) => {

      console.error(
        'Error WebSocket:',
        error
      );

      this.connected = false;

    };


    // =======================================================
    // ACTIVAR
    // =======================================================

    this.client.activate();

  }


  // =========================================================
  // SUSCRIPCIÓN A CONTACTOS
  // =========================================================

  private subscribeToContacts(): void {

    if (
      !this.client ||
      !this.connected
    ) {

      return;
    }


    this.client.subscribe(
      '/topic/contacts',

      (
        message: IMessage
      ) => {

        try {

          const contact: Contact =
            JSON.parse(
              message.body
            );


          this.contactsSubject.next(
            contact
          );


        } catch (error) {

          console.error(
            'Error procesando contacto WebSocket:',
            error
          );

        }

      }

    );

  }


  // =========================================================
  // SUSCRIPCIÓN A NOTIFICACIONES
  // =========================================================

  private subscribeToNotifications(): void {

    if (
      !this.client ||
      !this.connected
    ) {

      return;
    }


    this.client.subscribe(
      '/topic/notifications',

      (
        message: IMessage
      ) => {

        try {

          const notification:
            Notification =
              JSON.parse(
                message.body
              );


          /*
           * Conservamos el sistema actual
           * de notificaciones.
           */
          this.notificationService
            .addNotification(
              notification
            );


          /*
           * También exponemos la notificación
           * mediante Observable.
           */
          this.notificationsSubject.next(
            notification
          );


        } catch (error) {

          console.error(
            'Error procesando notificación WebSocket:',
            error
          );

        }

      }

    );

  }


  // =========================================================
  // SUSCRIPCIÓN A RESÚMENES
  // =========================================================

  /**
   * Escucha:
   *
   * /topic/conversations
   *
   * Este canal actualiza la lista compacta.
   */
  private subscribeToConversationSummaries(): void {

    if (
      !this.client ||
      !this.connected
    ) {

      return;
    }


    /*
     * Evitamos duplicar la suscripción.
     */
    if (
      this.conversationSummariesSubscription
    ) {

      this.conversationSummariesSubscription
        .unsubscribe();

      this.conversationSummariesSubscription =
        null;
    }


    console.log(
      'Suscribiendo a:',
      '/topic/conversations'
    );


    this.conversationSummariesSubscription =
      this.client.subscribe(
        '/topic/conversations',

        (
          message: IMessage
        ) => {

          try {

            const summary:
              ConversationSummaryResponse =
                JSON.parse(
                  message.body
                );


            console.log(
              'Actualización de conversación recibida:',
              summary
            );


            this.conversationSummariesSubject.next(
              summary
            );


          } catch (error) {

            console.error(
              'Error procesando resumen de conversación:',
              error
            );

          }

        }

      );

  }


  // =========================================================
  // SUSCRIBIRSE A UNA CONVERSACIÓN
  // =========================================================

  /**
   * Se suscribe al canal de una conversación específica.
   *
   * Canal:
   *
   * /topic/conversations/{conversationId}
   *
   * Este canal es utilizado por el chat abierto.
   */
  subscribeToConversation(
    conversationId: string
  ): Observable<any> {


    if (!conversationId) {

      console.error(
        'No se puede suscribir a una conversación sin ID.'
      );


      return new Observable(
        subscriber => {

          subscriber.complete();

        }
      );

    }


    /*
     * Si todavía no existe el Subject,
     * lo creamos.
     */
    let subject =
      this.conversationSubjects.get(
        conversationId
      );


    if (!subject) {

      subject =
        new Subject<any>();


      this.conversationSubjects.set(
        conversationId,
        subject
      );

    }


    /*
     * Si todavía no existe conexión,
     * iniciamos el WebSocket.
     *
     * La suscripción STOMP será creada
     * automáticamente en onConnect().
     */
    if (
      !this.client ||
      !this.connected
    ) {

      this.connect();

    } else {

      /*
       * Ya estamos conectados.
       */
      this.createConversationSubscription(
        conversationId
      );

    }


    return subject.asObservable();

  }


  // =========================================================
  // SUSCRIPCIÓN STOMP DE CONVERSACIÓN
  // =========================================================

  private createConversationSubscription(
    conversationId: string
  ): void {


    if (
      !this.client ||
      !this.connected
    ) {

      return;
    }


    const destination =
      `/topic/conversations/${conversationId}`;


    /*
     * Evitamos crear varias suscripciones
     * al mismo canal.
     */
    if (
      this.conversationSubscriptions.has(
        conversationId
      )
    ) {

      return;

    }


    console.log(
      'Creando suscripción STOMP:',
      destination
    );


    const subscription =
      this.client.subscribe(
        destination,

        (
          message: IMessage
        ) => {

          try {

            console.log(
              'Mensaje STOMP recibido:',
              conversationId
            );


            const parsedMessage =
              JSON.parse(
                message.body
              );


            console.log(
              'Mensaje de conversación procesado:',
              parsedMessage
            );


            const subject =
              this.conversationSubjects.get(
                conversationId
              );


            if (subject) {

              subject.next(
                parsedMessage
              );

            }


          } catch (error) {

            console.error(
              'Error procesando mensaje de conversación:',
              error
            );

          }

        }

      );


    this.conversationSubscriptions.set(
      conversationId,
      subscription
    );


    console.log(
      'Suscrito a conversación:',
      conversationId
    );

  }


  // =========================================================
  // CANCELAR SUSCRIPCIÓN
  // =========================================================

  /**
   * Cancela la suscripción STOMP y elimina el Subject
   * de una conversación.
   *
   * Debe utilizarse cuando el chat se cierre y ya no
   * se necesite escuchar esa conversación.
   */
  unsubscribeFromConversation(
    conversationId: string
  ): void {


    if (!conversationId) {
      return;
    }


    const subscription =
      this.conversationSubscriptions.get(
        conversationId
      );


    if (subscription) {

      subscription.unsubscribe();


      this.conversationSubscriptions.delete(
        conversationId
      );

    }


    const subject =
      this.conversationSubjects.get(
        conversationId
      );


    if (subject) {

      subject.complete();


      this.conversationSubjects.delete(
        conversationId
      );

    }


    console.log(
      'Suscripción eliminada:',
      conversationId
    );

  }


  // =========================================================
  // ESTADO DE CONEXIÓN
  // =========================================================

  /**
   * Permite consultar desde otros componentes
   * si actualmente existe conexión.
   */
  isConnected(): boolean {

    return this.connected;

  }


  // =========================================================
  // DESCONECTAR TODO
  // =========================================================

  disconnect(): void {


    if (!this.client) {

      return;
    }


    /*
     * Cancelamos primero las suscripciones
     * individuales.
     */
    this.conversationSubscriptions
      .forEach(
        subscription => {

          subscription.unsubscribe();

        }
      );


    this.conversationSubscriptions.clear();


    /*
     * Cancelamos la suscripción global
     * de conversaciones.
     */
    if (
      this.conversationSummariesSubscription
    ) {

      this.conversationSummariesSubscription
        .unsubscribe();

      this.conversationSummariesSubscription =
        null;

    }


    /*
     * Desactivamos STOMP.
     */
    this.client.deactivate();


    this.connected = false;


    /*
     * Cerramos los Subjects.
     */
    this.conversationSubjects
      .forEach(
        subject => {

          subject.complete();

        }
      );


    this.conversationSubjects.clear();


    console.log(
      'WebSocket desconectado manualmente.'
    );

  }

}