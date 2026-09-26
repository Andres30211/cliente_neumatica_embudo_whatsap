type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'AUDIO'
  | 'DOCUMENT'
  | 'STICKER'
  | 'LOCATION';

type ConversationStatus =
  | 'BOT'
  | 'HUMAN'
  | 'CLOSED';

export interface ConversationSummaryResponse {

  conversationId: string;

  contactId: string;

  contactName: string | null;

  phone: string | null;

  registrationStep: string | null;

  lastMessage: string | null;

  lastMessageType: MessageType;

  lastMessageAt: string | null;

  status: ConversationStatus;

  // Vendedor asignado
  assignedUserId: string | null;

  assignedUserName: string | null;

}