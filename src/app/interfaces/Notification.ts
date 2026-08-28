export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  createdAt: string;
  read: boolean;
}