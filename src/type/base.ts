// types/base.types.ts

export interface BaseEntity {
  id: number;
  business_owner_id: number;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total_records: number;
  current_page: number;
  per_page: number;
  total_pages: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
}