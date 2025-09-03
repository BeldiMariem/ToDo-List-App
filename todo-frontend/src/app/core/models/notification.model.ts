export interface NotificationDTO {
  id: number;
  message: string;
  seen: boolean;
  createdAt: string;
  userId?: string
}
