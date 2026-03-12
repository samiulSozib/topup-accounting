// types/reseller.types.ts
export interface IReseller {
  id: number;
  business_owner_id: number;
  name: string;
  phone: string;
  city: string;
  bonus_percentage: number;
  status: number | null; // 1 for active, 0 for inactive, null for not set
  createdAt: string;
  updatedAt: string;
}

export interface IResellerCreate {
  name: string;
  phone: string;
  city: string;
  bonus_percentage: number;
}

export interface IResellerUpdate {
  name?: string;
  phone?: string;
  city?: string;
}

export interface IResellerPercentageUpdate {
  bonus_percentage: number;
}

export interface IResellerStatusUpdate {
  status: number; // 1 for active, 0 for inactive
}

export interface IResellerResponse {
  status: boolean;
  message: string;
  reseller?: IReseller;
  resellers?: IReseller[];
  pagination?: {
    total_items: number;
    total_pages: number;
    current_page: number;
  };
}

export interface IResellerState {
  resellers: IReseller[];
  selectedReseller: IReseller | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
  } | null;
}