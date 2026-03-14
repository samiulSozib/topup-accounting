// types/transaction.types.ts

import { Pagination } from './base';
import { Supplier } from './supplier';
import { Reseller } from './reseller';

export type TransactionType = 
  | "purchase" 
  | "sale" 
  | "supplier_payment" 
  | "reseller_payment";

export interface TopUpTransaction {
  id: number;
  business_owner_id: number;
  supplier_id: number | null;
  reseller_id: number | null;
  transaction_type: TransactionType;
  base_amount: number;
  bonus_percentage: number;
  bonus_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  previous_due: number;
  reference_no: string | null;
  notes: string | null;
  transaction_date: string;
  createdAt: string;
  updatedAt: string;
  supplier?: Supplier;
  reseller?: Reseller;
}

export interface TransactionResponse {
  success: boolean;
  transactions: TopUpTransaction[];
  summary: {
    total_base_amount: number;
    total_paid_amount: number;
    total_bonus_amount: number;
  };
  pagination: Pagination;
}

export interface SingleTransactionResponse {
  success: boolean;
  transaction: TopUpTransaction;
  message?: string;
}

export interface BuyTopupRequest {
  supplier_id: number;
  base_amount: number;
  paid_amount?: number;
  reference_no?: string;
  notes?: string;
}

export interface SellTopupRequest {
  reseller_id: number;
  supplier_id: number;
  base_amount: number;
  paid_amount?: number;
  reference_no?: string;
  notes?: string;
}

export interface PaymentRequest {
  supplier_id?: number;
  reseller_id?: number;
  amount: number;
  reference_no?: string;
  notes?: string;
}

export interface TransactionFilter {
  page?: number;
  limit?: number;
  transaction_type?: TransactionType | string;
  supplier_id?: number;
  reseller_id?: number;
  search?: string;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
}