// types/supplier.types.ts
export interface ISupplier {
  id: number;
  business_owner_id: number;
  name: string;
  phone: string;
  company: string;
  bonus_percentage: number;
  status: number | null; // 1 for active, 0 for inactive, null for not set
  createdAt: string;
  updatedAt: string;
}

export interface ISupplierCreate {
  name: string;
  phone: string;
  company: string;
  bonus_percentage: number;
}

export interface ISupplierUpdate {
  name?: string;
  phone?: string;
  company?: string;
}

export interface ISupplierPercentageUpdate {
  bonus_percentage: number;
}

export interface ISupplierStatusUpdate {
  status: number; // 1 for active, 0 for inactive
}

export interface ISupplierResponse {
  status: boolean;
  message: string;
  supplier?: ISupplier;
  suppliers?: ISupplier[];
  pagination?: {
    total_items: number;
    total_pages: number;
    current_page: number;
  };
}

export interface ISupplierState {
  suppliers: ISupplier[];
  selectedSupplier: ISupplier | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
  } | null;
}