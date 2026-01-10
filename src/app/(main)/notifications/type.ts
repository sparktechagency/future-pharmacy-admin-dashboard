export interface Notification {
  _id: string;
  userId: string;
  message: string;
  role: string;
  type: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MetaData {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  meta: MetaData;
  data: Notification[];
}

// Map API status to frontend status types
export type FrontendStatus = 'Sent' | 'Pending' | 'Failed';
