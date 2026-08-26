export interface Notification {
  id: string;
  type: string;
  referenceId: number;
  message: string;
  recipientRole: string;
  read: boolean;
  createdAt: string;
}
