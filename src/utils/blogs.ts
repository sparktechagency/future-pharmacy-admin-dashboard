// Blog types
export interface Blog {
  _id: string;
  title: string;
  date: string;
  description: string;
  image: string;
  createdAt: string;
  blogLikes?: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Blog API specific types
export interface BlogResponse {
  data: PaginatedResponse<Blog>;
}

export interface CreateBlogRequest {
  title: string;
  date: string;
  description: string;
  image: File;
}

export interface UpdateBlogRequest {
  id: string;
  data: Partial<CreateBlogRequest> | FormData;
}

// Error types
export interface RTKError {
  data?: {
    message: string;
    error?: string;
    statusCode?: number;
  };
  status?: number;
  message?: string;
}

// Component Props types
export interface BlogCardProps {
  blog: Blog;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export interface BlogTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
}

export interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlog: Blog | null;
  onSuccess: () => void;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: Blog | null;
  onSuccess: () => void;
}

export interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;