import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Subscription
} from 'rxjs';

import {
  ConversationService
} from '../../services/conversation-service';

import {
  ServicesWebsocket
} from '../../services/services-websocket';

import {
  ServicesWhatsapp
} from '../../services/services-whatsapp';

import {
  ConversationSummaryResponse
} from '../../interfaces/ConversationSummaryResponse';


@Component({
  selector: 'conversation-chat',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './conversation-chat.html',

  styleUrl: './conversation-chat.css'
})
export class ConversationChat
  implements OnChanges, OnDestroy {


  // =========================================================
  // CONVERSACIÓN
  // =========================================================

  @Input({ required: true })
  conversation!:
    ConversationSummaryResponse | any;


  // =========================================================
  // MENSAJE
  // =========================================================

  public messageText = '';


  // =========================================================
  // ESTADOS
  // =========================================================

  public sending = false;

  public loading = false;

  public takingConversation = false;

  public errorMessage:
    string | null = null;


  // =========================================================
  // WEBSOCKET
  // =========================================================

  public websocketConnected = false;


  private conversationSubscription:
    Subscription | null = null;


  private subscribedConversationId:
    string | null = null;


  // =========================================================
  // CONTROL DE CARGA
  // =========================================================

  private loadRequestVersion = 0;


  // =========================================================
  // MULTIMEDIA
  // =========================================================

  /**
   * Guarda:
   *
   * whatsappMessageId -> blob URL
   *
   * Ejemplo:
   *
   * wamid.xxx -> blob:http://localhost...
   */
  private readonly mediaUrls =
    new Map<string, string>();


  /**
   * Mensajes cuyo multimedia se está descargando.
   */
  private readonly loadingMedia =
    new Set<string>();


  /**
   * Mensajes cuyo multimedia no pudo cargarse.
   */
  private readonly mediaErrors =
    new Set<string>();


  constructor(

    private conversationService:
      ConversationService,

    private servicesWebsocket:
      ServicesWebsocket,

    private servicesWhatsapp:
      ServicesWhatsapp,

    private elementRef:
      ElementRef,

    private cd:
      ChangeDetectorRef

  ) { }


  // =========================================================
  // CAMBIO DE CONVERSACIÓN
  // =========================================================

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      !changes['conversation']
    ) {

      return;

    }


    const conversationId =
      this.getConversationId(
        this.conversation
      );


    if (!conversationId) {

      return;

    }


    // Invalida peticiones anteriores.
    this.loadRequestVersion++;


    // Cancela WS anterior.
    this.unsubscribeFromConversation();


    // Libera multimedia anterior.
    this.clearMedia();


    this.messageText = '';

    this.errorMessage = null;

    this.sending = false;

    this.takingConversation = false;


    this.loadConversation(
      conversationId,
      this.loadRequestVersion
    );

  }


  // =========================================================
  // ID CONVERSACIÓN
  // =========================================================

  private getConversationId(
    conversation: any
  ): string | null {

    return (
      conversation?.conversationId ||
      conversation?.id ||
      null
    );

  }


  // =========================================================
  // CARGAR CONVERSACIÓN
  // =========================================================

  private loadConversation(
    conversationId: string,
    requestVersion: number
  ): void {

    this.loading = true;

    this.errorMessage = null;


    const summary =
      this.conversation;


    this.conversationService
      .getConversation(
        conversationId
      )
      .subscribe({

        next: (response) => {


          if (
            requestVersion !==
            this.loadRequestVersion
          ) {

            return;

          }


          const responseId =
            this.getConversationId(
              response
            ) ||
            conversationId;


          const contact = {

            ...(response?.contact || {}),

            id:
              response?.contact?.id ||
              summary?.contactId ||
              summary?.contact?.id ||
              null,

            name:
              response?.contact?.name ||
              summary?.contactName ||
              summary?.contact?.name ||
              'Contacto sin nombre',

            phone:
              response?.contact?.phone ||
              summary?.phone ||
              summary?.contact?.phone ||
              null

          };


          this.conversation = {

            ...summary,

            ...response,

            id:
              responseId,

            conversationId:
              responseId,

            status:
              response?.status ||
              summary?.status,

            contact,

            messages:
              Array.isArray(
                response?.messages
              )
                ? response.messages
                : []

          };


          this.sortMessagesByDate();


          this.loading = false;


          this.cd.detectChanges();


          // Carga imágenes, videos, audio,
          // documentos, stickers, etc.
          this.loadConversationMedia();


          this.subscribeToConversation(
            conversationId
          );


          this.scrollToBottom();

        },


        error: (error) => {


          if (
            requestVersion !==
            this.loadRequestVersion
          ) {

            return;

          }


          console.error(
            'Error obteniendo conversación:',
            error
          );


          this.loading = false;


          this.errorMessage =
            error?.error?.message ||
            'No fue posible cargar la conversación.';


          this.cd.detectChanges();

        }

      });

  }


  // =========================================================
  // TOMAR CONVERSACIÓN
  // =========================================================

  public takeConversation(): void {

    const conversationId =
      this.getConversationId(
        this.conversation
      );


    if (
      !conversationId ||
      this.takingConversation ||
      this.conversation?.status !== 'BOT'
    ) {

      return;

    }


    this.takingConversation = true;

    this.errorMessage = null;


    this.conversationService
      .takeConversation(
        conversationId
      )
      .subscribe({

        next: (response) => {


          const currentContact =
            this.conversation?.contact;


          const currentMessages =
            Array.isArray(
              this.conversation?.messages
            )
              ? this.conversation.messages
              : [];


          this.conversation = {

            ...this.conversation,

            ...(response || {}),

            id:
              response?.id ||
              conversationId,

            conversationId,

            status:
              response?.status ||
              'HUMAN',

            contact:
              response?.contact ||
              currentContact,

            messages:
              Array.isArray(
                response?.messages
              )
                ? response.messages
                : currentMessages

          };


          this.sortMessagesByDate();


          this.takingConversation = false;

          this.errorMessage = null;


          this.cd.detectChanges();


          this.loadConversationMedia();


          this.scrollToBottom();

        },


        error: (error) => {

          console.error(
            'Error tomando conversación:',
            error
          );


          this.takingConversation = false;


          this.errorMessage =
            error?.error?.message ||
            'No fue posible tomar la conversación.';


          this.cd.detectChanges();

        }

      });

  }


  // =========================================================
  // FECHA DEL MENSAJE
  // =========================================================

  private getMessageTimestamp(
    message: any
  ): number {

    if (!message?.createdAt) {

      return 0;

    }


    const timestamp =
      new Date(
        message.createdAt
      ).getTime();


    return Number.isFinite(
      timestamp
    )
      ? timestamp
      : 0;

  }


  private sortMessagesByDate(): void {

    if (
      !Array.isArray(
        this.conversation?.messages
      )
    ) {

      return;

    }


    this.conversation.messages.sort(
      (a: any, b: any) =>
        this.getMessageTimestamp(a) -
        this.getMessageTimestamp(b)
    );

  }


  // =========================================================
  // MULTIMEDIA
  // =========================================================

  /**
   * Determina si el mensaje contiene un archivo
   * que debe solicitarse al backend.
   */
  public isMediaMessage(
    message: any
  ): boolean {

    const type =
      message?.type;


    return (
      type === 'IMAGE' ||
      type === 'VIDEO' ||
      type === 'AUDIO' ||
      type === 'DOCUMENT' ||
      type === 'STICKER'
    );

  }


  /**
   * Carga todo el multimedia existente en la conversación.
   */
  private loadConversationMedia(): void {

    const messages =
      this.conversation?.messages;


    if (!Array.isArray(messages)) {

      return;

    }


    messages.forEach(
      (message: any) => {

        if (
          this.isMediaMessage(message)
        ) {

          this.loadMedia(
            message
          );

        }

      }
    );

  }


  /**
   * Descarga un multimedia y crea un ObjectURL.
   *
   * Nunca solicita dos veces el mismo archivo.
   */
  private loadMedia(
    message: any
  ): void {

    const whatsappMessageId =
      message?.whatsappMessageId;


    if (
      !whatsappMessageId ||
      !this.isMediaMessage(message)
    ) {

      return;

    }


    if (
      this.mediaUrls.has(
        whatsappMessageId
      ) ||
      this.loadingMedia.has(
        whatsappMessageId
      )
    ) {

      return;

    }


    this.loadingMedia.add(
      whatsappMessageId
    );


    this.mediaErrors.delete(
      whatsappMessageId
    );


    this.servicesWhatsapp
      .getMessageMedia(
        whatsappMessageId
      )
      .subscribe({

        next: (blob) => {


          this.loadingMedia.delete(
            whatsappMessageId
          );


          if (
            !blob ||
            blob.size === 0
          ) {

            this.mediaErrors.add(
              whatsappMessageId
            );

            this.cd.detectChanges();

            return;

          }


          const url =
            URL.createObjectURL(
              blob
            );


          this.mediaUrls.set(
            whatsappMessageId,
            url
          );


          this.cd.detectChanges();


          /**
           * Una imagen puede cambiar la altura
           * total del chat.
           */
          this.scrollToBottom();

        },


        error: (error) => {

          console.error(
            'Error cargando multimedia:',
            whatsappMessageId,
            error
          );


          this.loadingMedia.delete(
            whatsappMessageId
          );


          this.mediaErrors.add(
            whatsappMessageId
          );


          this.cd.detectChanges();

        }

      });

  }


  /**
   * URL temporal del archivo.
   */
  public getMediaUrl(
    message: any
  ): string | null {

    const whatsappMessageId =
      message?.whatsappMessageId;


    if (!whatsappMessageId) {

      return null;

    }


    return (
      this.mediaUrls.get(
        whatsappMessageId
      ) ||
      null
    );

  }


  /**
   * Indica si el archivo está cargando.
   */
  public isMediaLoading(
    message: any
  ): boolean {

    const whatsappMessageId =
      message?.whatsappMessageId;


    if (!whatsappMessageId) {

      return false;

    }


    return this.loadingMedia.has(
      whatsappMessageId
    );

  }


  /**
   * Indica si ocurrió un error.
   */
  public hasMediaError(
    message: any
  ): boolean {

    const whatsappMessageId =
      message?.whatsappMessageId;


    if (!whatsappMessageId) {

      return false;

    }


    return this.mediaErrors.has(
      whatsappMessageId
    );

  }


  /**
   * Permite intentar nuevamente.
   */
  public retryMedia(
    message: any
  ): void {

    const whatsappMessageId =
      message?.whatsappMessageId;


    if (!whatsappMessageId) {

      return;

    }


    this.mediaErrors.delete(
      whatsappMessageId
    );


    this.loadMedia(
      message
    );

  }


  // =========================================================
  // DESCARGAR MULTIMEDIA
  // =========================================================

  public downloadMedia(
    message: any
  ): void {

    const whatsappMessageId =
      message?.whatsappMessageId;


    if (!whatsappMessageId) {

      return;

    }


    /**
     * Si ya tenemos el Blob cargado,
     * reutilizamos su URL.
     */
    const existingUrl =
      this.getMediaUrl(
        message
      );


    if (existingUrl) {

      this.triggerDownload(
        existingUrl,
        this.getMediaFileName(
          message
        )
      );

      return;

    }


    /**
     * Si todavía no está cargado,
     * lo solicitamos al backend.
     */
    this.servicesWhatsapp
      .getMessageMedia(
        whatsappMessageId
      )
      .subscribe({

        next: (blob) => {

          const url =
            URL.createObjectURL(
              blob
            );


          this.triggerDownload(
            url,
            this.getMediaFileName(
              message
            )
          );


          /**
           * Esta URL solamente se utilizó
           * para la descarga.
           */
          setTimeout(
            () => {
              URL.revokeObjectURL(
                url
              );
            },
            1000
          );

        },


        error: (error) => {

          console.error(
            'Error descargando multimedia:',
            error
          );


          this.errorMessage =
            'No fue posible descargar el archivo.';


          this.cd.detectChanges();

        }

      });

  }


  private triggerDownload(
    url: string,
    fileName: string
  ): void {

    const anchor =
      document.createElement(
        'a'
      );


    anchor.href =
      url;


    anchor.download =
      fileName;


    anchor.style.display =
      'none';


    document.body.appendChild(
      anchor
    );


    anchor.click();


    anchor.remove();

  }


  // =========================================================
  // ABRIR DOCUMENTO
  // =========================================================

  public openMedia(
    message: any
  ): void {

    const url =
      this.getMediaUrl(
        message
      );


    if (!url) {

      return;

    }


    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );

  }


  // =========================================================
  // NOMBRE ARCHIVO
  // =========================================================

  public getMediaFileName(
    message: any
  ): string {

    if (
      message?.fileName &&
      message.fileName.trim()
    ) {

      return message.fileName;

    }


    const type =
      message?.type;


    const mimeType =
      message?.mimeType ||
      '';


    const extension =
      this.getExtensionFromMimeType(
        mimeType
      );


    switch (type) {

      case 'IMAGE':

        return `imagen${extension}`;

      case 'VIDEO':

        return `video${extension}`;

      case 'AUDIO':

        return `audio${extension}`;

      case 'STICKER':

        return `sticker${extension}`;

      case 'DOCUMENT':

        return `documento${extension}`;

      default:

        return `archivo${extension}`;

    }

  }


  private getExtensionFromMimeType(
    mimeType: string
  ): string {

    const normalized =
      mimeType
        ?.toLowerCase()
        .split(';')[0]
        .trim();


    switch (normalized) {

      case 'image/jpeg':
        return '.jpg';

      case 'image/png':
        return '.png';

      case 'image/webp':
        return '.webp';

      case 'image/gif':
        return '.gif';

      case 'video/mp4':
        return '.mp4';

      case 'video/3gpp':
        return '.3gp';

      case 'audio/mpeg':
        return '.mp3';

      case 'audio/ogg':
        return '.ogg';

      case 'audio/mp4':
        return '.m4a';

      case 'audio/aac':
        return '.aac';

      case 'application/pdf':
        return '.pdf';

      case 'application/msword':
        return '.doc';

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '.docx';

      case 'application/vnd.ms-excel':
        return '.xls';

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '.xlsx';

      default:
        return '';

    }

  }


  // =========================================================
  // LIMPIAR MULTIMEDIA
  // =========================================================

  private clearMedia(): void {

    this.mediaUrls.forEach(
      (url) => {

        URL.revokeObjectURL(
          url
        );

      }
    );


    this.mediaUrls.clear();

    this.loadingMedia.clear();

    this.mediaErrors.clear();

  }


  // =========================================================
  // WEBSOCKET
  // =========================================================

  private subscribeToConversation(
    conversationId: string
  ): void {

    if (!conversationId) {

      return;

    }


    if (
      this.subscribedConversationId ===
      conversationId
    ) {

      return;

    }


    this.unsubscribeFromConversation();


    this.subscribedConversationId =
      conversationId;


    this.websocketConnected =
      false;


    console.log(
      'Conectando chat al WebSocket:',
      conversationId
    );


    this.conversationSubscription =
      this.servicesWebsocket
        .subscribeToConversation(
          conversationId
        )
        .subscribe({

          next: (message) => {


            if (
              this.getConversationId(
                this.conversation
              ) !== conversationId
            ) {

              return;

            }


            this.websocketConnected =
              true;


            this.handleRealtimeMessage(
              message
            );

          },


          error: (error) => {

            console.error(
              'Error escuchando conversación por WebSocket:',
              error
            );


            this.websocketConnected =
              false;


            this.cd.detectChanges();

          },


          complete: () => {

            this.websocketConnected =
              false;


            this.cd.detectChanges();

          }

        });

  }


  // =========================================================
  // MENSAJE EN TIEMPO REAL
  // =========================================================

  private handleRealtimeMessage(
    message: any
  ): void {

    if (!message) {

      return;

    }


    if (
      !Array.isArray(
        this.conversation?.messages
      )
    ) {

      this.conversation.messages = [];

    }


    if (
      this.messageAlreadyExists(
        message
      )
    ) {

      return;

    }


    this.conversation.messages.push(
      message
    );


    this.sortMessagesByDate();


    /**
     * Si el mensaje que acaba de llegar
     * contiene multimedia, lo cargamos.
     */
    if (
      this.isMediaMessage(
        message
      )
    ) {

      this.loadMedia(
        message
      );

    }


    this.cd.detectChanges();


    this.scrollToBottom();

  }


  // =========================================================
  // DUPLICADOS
  // =========================================================

  private messageAlreadyExists(
    message: any
  ): boolean {

    if (
      !Array.isArray(
        this.conversation?.messages
      )
    ) {

      return false;

    }


    return this.conversation.messages.some(
      (
        existingMessage: any
      ) => {


        if (
          existingMessage?.id &&
          message?.id
        ) {

          return (
            existingMessage.id ===
            message.id
          );

        }


        if (
          existingMessage?.whatsappMessageId &&
          message?.whatsappMessageId
        ) {

          return (
            existingMessage.whatsappMessageId ===
            message.whatsappMessageId
          );

        }


        return (

          existingMessage?.body ===
          message?.body &&

          existingMessage?.direction ===
          message?.direction &&

          existingMessage?.createdAt ===
          message?.createdAt

        );

      }
    );

  }


  // =========================================================
  // ENVIAR MENSAJE
  // =========================================================

  public sendMessage(): void {

    const text =
      this.messageText.trim();


    const conversationId =
      this.getConversationId(
        this.conversation
      );


    if (!text) {

      return;

    }


    if (
      this.conversation?.status !==
      'HUMAN'
    ) {

      this.errorMessage =
        'Debes atender la conversación antes de enviar mensajes.';

      return;

    }


    if (
      this.sending ||
      !conversationId
    ) {

      return;

    }


    this.sending = true;

    this.errorMessage = null;


    this.conversationService
      .sendMessage(
        conversationId,
        text
      )
      .subscribe({

        next: (message) => {


          if (
            !Array.isArray(
              this.conversation?.messages
            )
          ) {

            this.conversation.messages = [];

          }


          if (
            !this.messageAlreadyExists(
              message
            )
          ) {

            this.conversation.messages.push(
              message
            );

          }


          this.sortMessagesByDate();


          if (
            this.isMediaMessage(
              message
            )
          ) {

            this.loadMedia(
              message
            );

          }


          this.messageText = '';

          this.sending = false;


          this.cd.detectChanges();


          this.scrollToBottom();

        },


        error: (error) => {

          console.error(
            'Error enviando mensaje:',
            error
          );


          this.errorMessage =
            error?.error?.message ||
            'No fue posible enviar el mensaje.';


          this.sending = false;


          this.cd.detectChanges();

        }

      });

  }


  // =========================================================
  // ENTER
  // =========================================================

  public onKeyDown(
    event: KeyboardEvent
  ): void {

    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {

      event.preventDefault();


      if (
        this.conversation?.status ===
        'HUMAN'
      ) {

        this.sendMessage();

      }

    }

  }


  // =========================================================
  // DIRECCIÓN
  // =========================================================

  public isOutgoing(
    message: any
  ): boolean {

    return (

      message?.direction ===
      'OUTBOUND' ||

      message?.direction ===
      'OUTGOING'

    );

  }


  // =========================================================
  // CANCELAR WEBSOCKET
  // =========================================================

  private unsubscribeFromConversation(): void {

    if (
      this.conversationSubscription
    ) {

      this.conversationSubscription
        .unsubscribe();


      this.conversationSubscription =
        null;

    }


    if (
      this.subscribedConversationId
    ) {

      this.servicesWebsocket
        .unsubscribeFromConversation(
          this.subscribedConversationId
        );

    }


    this.subscribedConversationId =
      null;


    this.websocketConnected =
      false;

  }


  // =========================================================
  // SCROLL
  // =========================================================

  private scrollToBottom(): void {

    setTimeout(
      () => {

        const container =
          this.elementRef
            .nativeElement
            .querySelector(
              '.chat-messages'
            ) as HTMLElement | null;


        if (!container) {

          return;

        }


        container.scrollTop =
          container.scrollHeight;

      },
      50
    );

  }


  // =========================================================
  // SEPARADORES DE FECHA
  // =========================================================

  public shouldShowDateSeparator(
    index: number
  ): boolean {

    const messages =
      this.conversation?.messages;


    if (
      !Array.isArray(messages) ||
      !messages[index]?.createdAt
    ) {

      return false;

    }


    if (index === 0) {

      return true;

    }


    const current =
      new Date(
        messages[index].createdAt
      );


    const previous =
      new Date(
        messages[index - 1].createdAt
      );


    return (

      current.getFullYear() !==
      previous.getFullYear() ||

      current.getMonth() !==
      previous.getMonth() ||

      current.getDate() !==
      previous.getDate()

    );

  }


  public getDateLabel(
    createdAt: string
  ): string {

    const date =
      new Date(
        createdAt
      );


    const today =
      new Date();


    const yesterday =
      new Date();


    yesterday.setDate(
      today.getDate() - 1
    );


    if (
      this.isSameDay(
        date,
        today
      )
    ) {

      return 'HOY';

    }


    if (
      this.isSameDay(
        date,
        yesterday
      )
    ) {

      return 'AYER';

    }


    return date.toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }


  private isSameDay(
    first: Date,
    second: Date
  ): boolean {

    return (

      first.getFullYear() ===
      second.getFullYear() &&

      first.getMonth() ===
      second.getMonth() &&

      first.getDate() ===
      second.getDate()

    );

  }


  // =========================================================
  // DESTRUIR
  // =========================================================

  ngOnDestroy(): void {

    this.loadRequestVersion++;


    this.unsubscribeFromConversation();


    /**
     * Muy importante:
     *
     * libera todas las blob URLs generadas
     * durante la vida del componente.
     */
    this.clearMedia();

  }

}