export interface Report {
  _id: string;
  createdAt: string | Date;
  message: string;
  userId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  action?: "warn" | "delete" | "read";
}
