export interface Message {

  id: string;

  whatsappMessageId: string;

  direction: string;

  type: string;

  body?: string;

  mediaId?: string;

  mimeType?: string;

  sha256?: string;

  caption?: string;

  fileName?: string;

  storagePath?: string;

  whatsappTimestamp?: number;

  createdAt?: string;
}