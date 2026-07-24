import { Conversations } from "./Conversations";

export interface Contact{

    id: string;
    name: string;
    phone: string;
    email: string | null;
    company: string | null;
    metaUserId: string;
    registrationStep: string;
    createdAt: string;
    firstContact: string;
    lastInteraction: string;
    conversations: Conversations[];
}