import { Message } from "./Message";

export interface Conversations{

    id: string;
    lastMessageAt: string;
    startedAt: string;
    closedAt: string | null;
    assignedTo: string | null;
    status: string;
    messages: Message[]
}