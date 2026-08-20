import { Contact } from "./Contact";

export interface ContactPage {
  content: Contact[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}