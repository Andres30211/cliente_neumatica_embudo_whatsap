export interface Messages{

    id: string;
    body: string;
    caption: string | null;
    createdAt: string;
    direction: string;
    mediaId: string | null;
    mimeType: string | null;
    sha256: string | null;
    type: string;
    whatsappMessageId: string;
    whatsappTimestamp: string;
    }