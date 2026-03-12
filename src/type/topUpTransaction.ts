// types/topUpTransaction.types.ts
export type TransactionType = 'purchase' | 'sale' | 'supplier_payment' | 'reseller_payment';

export interface ITopUpTransaction {
  id: number;
  business_owner_id: number;
  supplier_id: number | null;
  reseller_id: number | null;
  transaction_type: TransactionType;
  base_amount: number;
  bonus_percentage: number;
  topup_amount: number;
  debit: number;
  credit: number;
  reference_no: string | null;
  notes: string | null;
  transaction_date: string;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: number;
    name: string;
    company: string;
  };
  reseller?: {
    id: number;
    name: string;
    city: string;
  };
}

// Buy Topup from Supplier
export interface IBuyTopupRequest {
  supplier_id: number;
  base_amount: number;
  paid_amount?: number;
  reference_no?: string;
  notes?: string;
}

// Sell Topup to Reseller
export interface ISellTopupRequest {
  reseller_id: number;
  supplier_id: number;
  base_amount: number;
  paid_amount?: number;
  reference_no?: string;
  notes?: string;
}

// Supplier Payment
export interface ISupplierPaymentRequest {
  supplier_id: number;
  amount: number;
  reference_no?: string;
  notes?: string;
}

// Reseller Payment
export interface IResellerPaymentRequest {
  reseller_id: number;
  amount: number;
  reference_no?: string;
  notes?: string;
}

// Supplier Statistics
export interface ISupplierStatistics {
  total_purchase: number;
  total_paid: number;
  total_due: number;
  current_stock: number;
}

// Reseller Statistics
export interface IResellerStatistics {
  total_sale: number;
  total_paid: number;
  total_due: number;
}



// Supplier Statistics Response
export interface ISupplierStatisticsResponse {
  total_purchase: number;
  total_paid: number;
  total_due: number;
  current_stock: number;
}

// Reseller Statistics Response
export interface IResellerStatisticsResponse {
  total_sale: number;
  total_paid: number;
  total_due: number;
}

// Monthly Transactions Query
export interface IMonthlyTransactionsQuery {
  month: number; // 1-12
  year: number;
}

// Stock Query
export interface IStockQuery {
  supplier_id: number;
}

export interface ITransactionFilters {
  transaction_type?: string; // Can be single type or comma-separated: "purchase,sale"
}

// ==================== Profit Statistics Types ====================

// Profit Statistics structure that matches your API response
export interface IProfitStatistics {
  total: {
    revenue: number;
    cost: number;
    profit: number;
    supplier_due: number;
    reseller_due: number;
  };
  today: {
    revenue: number;
    cost: number;
    profit: number;
  };
}

// Transactions State
export interface ITransactionsState {
  transactions: ITopUpTransaction[];
  selectedTransaction: ITopUpTransaction | null;
  isLoading: boolean;
  error: string | null;
  monthlyTransactions: ITopUpTransaction[];
  currentStock: number | null;
  supplierStatistics: ISupplierStatistics | null;
  resellerStatistics: IResellerStatistics | null;
  profitStatistics: IProfitStatistics | null;
}

// Profit Statistics Response (matches API response)
export interface IProfitStatisticsResponse {
  total: {
    revenue: number;
    cost: number;
    profit: number;
    supplier_due: number;
    reseller_due: number;
  };
  today: {
    revenue: number;
    cost: number;
    profit: number;
  };
}

export interface ISupplierDuePaymentRequest {
  transaction_id: number;
  amount: number;
  reference_no?: string;
  notes?: string;
}

// Add this interface for payment response
export interface ISupplierPaymentResponse {
  message: string;
  paid: number;
  remaining_due: number;
}

// Add this interface for reseller payment collection
export interface IResellerDueCollectionRequest {
  transaction_id: number;
  amount: number;
  reference_no?: string;
  notes?: string;
}

// Add this interface for collection response
export interface IResellerCollectionResponse {
  message: string;
  collected: number;
  remaining_due: number;
}


// Add this new interface for transaction filters
export interface ITransactionFilters {
  transaction_type?: string; // Can be single type or comma-separated: "purchase,sale"
  supplier_id?: number;
  reseller_id?: number;
  search?: string;
  min_amount?: number;
  max_amount?: number;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

// Update Transaction Response to include pagination
export interface ITransactionResponse {
  status: boolean;
  message?: string;
  transaction?: ITopUpTransaction;
  transactions?: ITopUpTransaction[];
  stock?: number;
  pagination?: {
    total_records: number;
    current_page: number;
    per_page: number;
    total_pages: number;
  };
}