// types/reseller.types.ts

import { BaseEntity, Pagination } from './base';
import { TopUpTransaction } from './topUpTransaction';

export interface Reseller extends BaseEntity {
  name: string;
  phone: string;
  city: string;
  bonus_percentage: number;
  total_sell_amount: number;
  total_sell_topup: number;
  total_sell_topup_with_bonus: number;
  total_received_amount: number;
  total_due_amount: number;
}

export interface ResellerResponse {
  status: boolean;
  message: string;
  resellers: Reseller[];
  pagination: Pagination;
}

export interface SingleResellerResponse {
  status: boolean;
  message: string;
  reseller: Reseller;
}

export interface ResellerStatistics {
  total_sale_amount: number;
  total_sale_with_bonus: number;
  total_received: number;
  total_due: number;
  total_bonus_given: number;
  average_bonus_percentage: number;
  collection_ratio: string;
}

export interface SupplierBreakdown {
  supplier_id: number;
  total_purchases: number;
  total_with_bonus: number;
  transaction_count: number;
  avg_bonus: number;
  supplier: {
    id: number;
    name: string;
    company: string;
  } | null;
}

export interface DailySummary {
  date: string;
  sales: number;
  collections: number;
  sale_count: number;
  payment_count: number;
}

export interface ResellerStatisticsResponse {
  success: boolean;
  reseller: Partial<Reseller>;
  summary: ResellerStatistics;
  supplier_breakdown: SupplierBreakdown[];
  recent_transactions: {
    sales: TopUpTransaction[];
    payments: TopUpTransaction[];
    showing: string;
  };
  all_transactions: {
    data: TopUpTransaction[];
    pagination: Pagination;
  };
  daily_summary: DailySummary[];
}

export interface CreateResellerRequest {
  name: string;
  phone: string;
  city: string;
  bonus_percentage: number;
}

export interface UpdateResellerRequest {
  name?: string;
  phone?: string;
  city?: string;
  bonus_percentage?: number;
}