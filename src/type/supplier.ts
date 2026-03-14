// types/supplier.types.ts

import { BaseEntity, Pagination } from './base';
import { TopUpTransaction } from './topUpTransaction';

export interface Supplier extends BaseEntity {
  name: string;
  phone: string;
  company: string;
  bonus_percentage: number;
  total_buy_amount: number;
  total_buy_topup: number;
  total_buy_topup_with_bonus: number;
  total_paid_amount: number;
  total_due_amount: number;
  current_stock: number;
}

export interface SupplierResponse {
  status: boolean;
  message: string;
  suppliers: Supplier[];
  pagination: Pagination;
}

export interface SingleSupplierResponse {
  status: boolean;
  message: string;
  supplier: Supplier;
}

export interface SupplierStatistics {
  total_purchase_amount: number;
  total_purchase_with_bonus: number;
  total_paid: number;
  total_due: number;
  current_stock: number;
  total_bonus_received: number;
  average_bonus_percentage: number;
}

export interface SupplierStatisticsResponse {
  success: boolean;
  supplier: Partial<Supplier>;
  summary: SupplierStatistics;
  recent_transactions: {
    purchases: TopUpTransaction[];
    payments: TopUpTransaction[];
    showing: string;
  };
  all_transactions: {
    data: TopUpTransaction[];
    pagination: Pagination;
  };
}

export interface CreateSupplierRequest {
  name: string;
  phone: string;
  company: string;
  bonus_percentage: number;
}

export interface UpdateSupplierRequest {
  name?: string;
  phone?: string;
  company?: string;
  bonus_percentage?: number;
}

export interface SupplierStockResponse {
  success: boolean;
  supplier: {
    id: number;
    name: string;
    current_stock: number;
    total_purchased: number;
  };
  recent_movements: Array<{
    id: number;
    transaction_type: string;
    base_amount: number;
    total_amount: number;
    transaction_date: string;
  }>;
}