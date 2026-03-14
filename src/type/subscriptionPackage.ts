// types/subscriptionPackage.types.ts

export interface SubscriptionPackage {
  id: number;
  name: string;
  description: string;
  duration_type: 'months' | 'yearly' | 'custom';
  duration_value: number;
  price: string;
  currency: string;
  web_access: boolean;
  mobile_access: boolean;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SubscriptionPackagesResponse {
  status: boolean;
  message: string;
  packages: SubscriptionPackage[];
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
    item_per_page: number;
  };
}

export interface SubscriptionPackageParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
  is_featured?: boolean;
  web_access?: boolean;
  mobile_access?: boolean;
  duration_type?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
}