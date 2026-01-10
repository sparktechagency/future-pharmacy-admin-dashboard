export interface Notification {
  id: string;
  _id?: string; // MongoDB ID from API
  title: string;
  message: string;
  body?: string; // Alternative field name from API
  type: "info" | "success" | "warning" | "error";
  time: string;
  read: boolean;
  isRead?: boolean; // Alternative field name from API
  createdAt: string;
}
