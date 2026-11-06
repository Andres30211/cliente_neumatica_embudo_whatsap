import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { ConversationSummaryResponse }
  from '../../interfaces/ConversationSummaryResponse';
import { ConversationService } from '../../services/conversation-service';


@Component({
  selector: 'whatsapp-embudo',

  imports: [
    CommonModule
  ],

  templateUrl: './whatsapp-embudo.html',

  styleUrl: './whatsapp-embudo.css',
})
export class WhatsappEmbudo {


  // =========================================================
  // CONVERSACIÓN
  // =========================================================

  /**
   * Resumen de la conversación que este card representa.
   */
  @Input({ required: true })
  conversation!: ConversationSummaryResponse;


  // =========================================================
  // SELECCIONADA
  // =========================================================

  /**
   * Indica si esta conversación es la que actualmente
   * está siendo visualizada en la columna derecha.
   *
   * IMPORTANTE:
   *
   * selected NO tiene relación con:
   *
   * BOT
   * HUMAN
   * CLOSED
   *
   * Es únicamente un estado visual del frontend.
   */
  @Input()
  selected = false;


  // =========================================================
  // EVENTO DE SELECCIÓN
  // =========================================================

  /**
   * Informa al componente padre que el usuario desea
   * visualizar esta conversación.
   *
   * Este evento:
   *
   * NO toma la conversación.
   * NO llama takeConversation().
   * NO cambia BOT -> HUMAN.
   * NO asigna vendedor.
   */
  @Output()
  conversationSelected =
    new EventEmitter<ConversationSummaryResponse>();

  constructor(private conversationService: ConversationService) { }


  // =========================================================
  // SELECCIONAR
  // =========================================================

  public selectConversation(): void {

    if (!this.conversation?.conversationId) {

      console.error('No se puede seleccionar una conversación sin ID.');

      return;

    }

    // Marcar como leída en el backend
    this.conversationService.markConversationAsRead(this.conversation.conversationId).subscribe({
      next: () => {

        console.log('sin contador');

      },
      error: (error) => {
        console.error('Error marcando la conversación como leída:', error);
      }
    });

    this.conversationSelected.emit(this.conversation);

  }

}