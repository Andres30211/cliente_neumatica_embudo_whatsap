import {
  Component,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { ServicesWhatsapp }
  from '../../services/services-whatsapp';

import { WhatsappEmbudo }
  from '../whatsapp-embudo/whatsapp-embudo';

import { ConversationChat }
  from '../conversation-chat/conversation-chat';

import { Topbar }
  from '../topbar/topbar';

import { Sidebar }
  from '../sidebar/sidebar';

import { ServicesWebsocket }
  from '../../services/services-websocket';

import { TokensServices }
  from '../../services/tokens-services';

import { ConversationSummaryResponse }
  from '../../interfaces/ConversationSummaryResponse';


@Component({
  selector: 'app-contacts-page',

  imports: [
    WhatsappEmbudo,
    ConversationChat,
    Topbar,
    Sidebar,
    CommonModule
  ],

  templateUrl: './contacts-page.html',

  styleUrl: './contacts-page.css',
})
export class ContactsPage implements OnInit {


  // =========================================================
  // CONVERSACIONES
  // =========================================================

  public contacts =
    signal<ConversationSummaryResponse[]>([]);


  // =========================================================
  // CONVERSACIÓN SELECCIONADA
  // =========================================================

  /**
   * Esta conversación representa únicamente
   * la conversación que el usuario está viendo.
   *
   * IMPORTANTE:
   *
   * Seleccionar una conversación NO significa
   * tomarla ni cambiar BOT -> HUMAN.
   */
  public selectedConversation =
    signal<ConversationSummaryResponse | null>(null);


  // =========================================================
  // PAGINACIÓN
  // =========================================================

  public currentPage =
    signal(0);

  public totalPages =
    signal(0);

  public totalElements =
    signal(0);

  public readonly pageSize = 5;


  // =========================================================
  // CAMPAÑA
  // =========================================================

  public enviado = false;


  constructor(

    private servicesWhat:
      ServicesWhatsapp,

    private serviceWebs:
      ServicesWebsocket,

    private tokensServices:
      TokensServices

  ) { }


  // =========================================================
  // INICIALIZACIÓN
  // =========================================================

  ngOnInit(): void {

    this.loadContacts(0);

    this.serviceWebs.connect();


    /**
     * Canal global:
     *
     * /topic/conversations
     *
     * Actualiza los resúmenes de la columna izquierda.
     */
    this.serviceWebs
      .conversationSummaries$
      .subscribe({

        next: (conversation) => {

          console.log(
            '🔥 RESUMEN RECIBIDO EN CONTACTS PAGE:',
            conversation
          );

          this.updateConversationFromWebSocket(
            conversation
          );

        },

        error: (error) => {

          console.error(
            'Error recibiendo resumen de conversación:',
            error
          );

        }

      });

  }


  // =========================================================
  // SELECCIONAR CONVERSACIÓN
  // =========================================================

  /**
   * Solamente selecciona la conversación.
   *
   * NO llama al backend.
   * NO ejecuta takeConversation().
   * NO cambia BOT -> HUMAN.
   * NO asigna vendedor.
   */
  public selectConversation(
    conversation: ConversationSummaryResponse
  ): void {

    if (!conversation?.conversationId) {

      console.error(
        'No se puede seleccionar una conversación sin ID.'
      );

      return;

    }


    this.selectedConversation.set(
      conversation
    );

  }


  // =========================================================
  // VALIDAR SI UNA CONVERSACIÓN ESTÁ SELECCIONADA
  // =========================================================

  public isConversationSelected(
    conversation: ConversationSummaryResponse
  ): boolean {

    return (
      this.selectedConversation()
        ?.conversationId ===
      conversation.conversationId
    );

  }


  // =========================================================
  // ACTUALIZACIÓN WEBSOCKET
  // =========================================================

  public updateConversationFromWebSocket(
    conversation: ConversationSummaryResponse
  ): void {

    this.contacts.update((contacts) => {

      const exists =
        contacts.some(
          item =>
            item.conversationId ===
            conversation.conversationId
        );


      let updated:
        ConversationSummaryResponse[];


      if (exists) {

        updated =
          contacts.map(item =>

            item.conversationId ===
              conversation.conversationId

              ? {
                ...item,
                ...conversation,

                assignedUserId:
                  conversation.assignedUserId ??
                  item.assignedUserId,

                assignedUserName:
                  conversation.assignedUserName ??
                  item.assignedUserName
              }

              : item

          );

      } else {

        updated = [
          conversation,
          ...contacts
        ];

      }


      return updated.sort(
        (a, b) => {

          const dateA =
            a.lastMessageAt
              ? new Date(
                a.lastMessageAt
              ).getTime()
              : 0;


          const dateB =
            b.lastMessageAt
              ? new Date(
                b.lastMessageAt
              ).getTime()
              : 0;


          return dateB - dateA;

        }
      );

    });


    /**
     * Si la conversación que cambió por WebSocket
     * es precisamente la que tenemos abierta,
     * actualizamos también su resumen seleccionado.
     *
     * Esto permite que:
     *
     * BOT -> HUMAN
     * HUMAN -> CLOSED
     * HUMAN -> BOT
     *
     * se refleje en la columna derecha.
     */
    const selected =
      this.selectedConversation();


    if (
      selected?.conversationId ===
      conversation.conversationId
    ) {

      this.selectedConversation.set({

        ...selected,
        ...conversation,

        assignedUserId:
          conversation.assignedUserId ??
          selected.assignedUserId,

        assignedUserName:
          conversation.assignedUserName ??
          selected.assignedUserName

      });

    }

  }


  // =========================================================
  // ROL
  // =========================================================

  public meRol(
    rol: string
  ): boolean {

    const roles =
      this.tokensServices.getRoles();

    return roles.includes(rol);

  }


  // =========================================================
  // CAMPAÑA
  // =========================================================

  public sendCampaing(): void {

    this.enviado = true;


    this.servicesWhat
      .sendCampaing()
      .subscribe({

        next: (message) => {

          alert(message);

          this.enviado = false;

        },

        error: () => {

          alert(
            'Error al enviar emails...'
          );

          this.enviado = false;

        }

      });

  }


  // =========================================================
  // EXCEL
  // =========================================================

  public descargarExcel(): void {

    this.servicesWhat
      .downloadExcel()
      .subscribe(

        blob => {

          const url =
            window.URL.createObjectURL(
              blob
            );


          const a =
            document.createElement(
              'a'
            );


          a.href = url;

          a.download =
            'contactos.xlsx';


          a.click();


          window.URL.revokeObjectURL(
            url
          );

        }

      );

  }


  // =========================================================
  // CARGAR CONVERSACIONES
  // =========================================================

  public loadContacts(
    page: number
  ): void {

    this.servicesWhat
      .getContacts(page)
      .subscribe({

        next: (response) => {

          this.contacts.set(
            response.content
          );


          this.currentPage.set(
            response.number
          );


          this.totalPages.set(
            response.totalPages
          );


          this.totalElements.set(
            response.totalElements
          );

        },

        error: (error) => {

          console.error(
            'Error cargando conversaciones:',
            error
          );

        }

      });

  }


  // =========================================================
  // SIGUIENTE PÁGINA
  // =========================================================

  public nextPage(): void {

    if (
      this.currentPage() <
      this.totalPages() - 1
    ) {

      this.loadContacts(
        this.currentPage() + 1
      );

    }

  }


  // =========================================================
  // PÁGINA ANTERIOR
  // =========================================================

  public previousPage(): void {

    if (
      this.currentPage() > 0
    ) {

      this.loadContacts(
        this.currentPage() - 1
      );

    }

  }


  // =========================================================
  // IR A PÁGINA
  // =========================================================

  public goToPage(
    page: number
  ): void {

    if (
      page >= 0 &&
      page < this.totalPages()
    ) {

      this.loadContacts(
        page
      );

    }

  }


  // =========================================================
  // PAGINACIÓN VISUAL
  // =========================================================

  public get paginationItems():
    (number | string)[] {

    const total =
      this.totalPages();

    const current =
      this.currentPage();


    if (total <= 0) {

      return [];

    }


    if (total <= 8) {

      return Array.from(
        {
          length: total
        },
        (_, index) =>
          index
      );

    }


    const pages:
      (number | string)[] = [];


    pages.push(0);


    // ---------------------------------------------------------
    // CERCA DEL PRINCIPIO
    // ---------------------------------------------------------

    if (current <= 4) {

      for (
        let page = 1;
        page <= 7;
        page++
      ) {

        pages.push(page);

      }


      pages.push('...');

      pages.push(
        total - 1
      );


      return pages;

    }


    // ---------------------------------------------------------
    // CERCA DEL FINAL
    // ---------------------------------------------------------

    if (
      current >=
      total - 5
    ) {

      pages.push('...');


      for (
        let page = total - 8;
        page < total - 1;
        page++
      ) {

        pages.push(page);

      }


      pages.push(
        total - 1
      );


      return pages;

    }


    // ---------------------------------------------------------
    // MITAD
    // ---------------------------------------------------------

    pages.push('...');


    for (
      let page = current - 2;
      page <= current + 2;
      page++
    ) {

      pages.push(page);

    }


    pages.push('...');

    pages.push(
      total - 1
    );


    return pages;

  }


  // =========================================================
  // VALIDAR NÚMERO DE PÁGINA
  // =========================================================

  public isPageNumber(
    page: number | string
  ): page is number {

    return typeof page === 'number';

  }

}