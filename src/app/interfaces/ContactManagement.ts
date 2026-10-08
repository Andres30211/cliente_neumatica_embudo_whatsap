export interface Contact {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  company: string | null;
  registrationStep: string | null;
  firstContact: string | null;
  lastInteraction: string | null;
  createdAt: string | null;
}

export interface ContactPage {
  content: Contact[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ContactImportError {
  row: number;
  phone: string | null;
  message: string;
}

export interface ContactImportResponse {
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  errorDetails: ContactImportError[];
}