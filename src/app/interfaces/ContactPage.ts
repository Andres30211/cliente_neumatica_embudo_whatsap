import { ConversationSummaryResponse } from "./ConversationSummaryResponse";

export interface ContactPage {
  content: ConversationSummaryResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}