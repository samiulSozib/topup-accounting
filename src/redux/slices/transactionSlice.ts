// store/slices/transactionSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  TopUpTransaction,
  TransactionResponse,
  SingleTransactionResponse,
  BuyTopupRequest,
  SellTopupRequest,
  PaymentRequest,
  TransactionFilter,
  DashboardSummaryResponse,
  ProfitReportResponse,
  SupplierStockResponse,
  Pagination
} from '../../type';
import { ApiError } from '../../type/api';

const API_URL = import.meta.env.VITE_BASE_URL || '';

interface TransactionState {
  transactions: TopUpTransaction[];
  selectedTransaction: TopUpTransaction | null;
  dashboardSummary: DashboardSummaryResponse | null;
  profitReport: ProfitReportResponse | null;
  supplierStock: SupplierStockResponse | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  summary: {
    total_base_amount: number;
    total_paid_amount: number;
    total_bonus_amount: number;
  } | null;
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  dashboardSummary: null,
  profitReport: null,
  supplierStock: null,
  loading: false,
  error: null,
  pagination: null,
  summary: null
};

interface FetchSupplierStockParams {
  supplier_id: number;
}

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || apiError.message || 'An unexpected error occurred';
};

// ==================== Async Thunks ====================

// Fetch all transactions with filters
export const fetchTransactions = createAsyncThunk<
  TransactionResponse,
  TransactionFilter,
  { rejectValue: string }
>(
  'transactions/fetchTransactions',
  async (filters: TransactionFilter, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<TransactionResponse>(`${API_URL}/topup`, {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch single transaction by ID
export const fetchTransactionById = createAsyncThunk<
  SingleTransactionResponse,
  number,
  { rejectValue: string }
>(
  'transactions/fetchTransactionById',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<SingleTransactionResponse>(
        `${API_URL}/topup/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Buy topup from supplier
export const buyTopup = createAsyncThunk<
  SingleTransactionResponse,
  BuyTopupRequest,
  { rejectValue: string }
>(
  'transactions/buyTopup',
  async (data: BuyTopupRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<SingleTransactionResponse>(
        `${API_URL}/topup/supplier/buy`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Sell topup to reseller
export const sellTopup = createAsyncThunk<
  SingleTransactionResponse,
  SellTopupRequest,
  { rejectValue: string }
>(
  'transactions/sellTopup',
  async (data: SellTopupRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<SingleTransactionResponse>(
        `${API_URL}/topup/reseller/sell`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Make payment to supplier
export const makeSupplierPayment = createAsyncThunk<
  SingleTransactionResponse,
  PaymentRequest,
  { rejectValue: string }
>(
  'transactions/makeSupplierPayment',
  async (data: PaymentRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<SingleTransactionResponse>(
        `${API_URL}/topup/supplier/payment`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Receive payment from reseller
export const receiveResellerPayment = createAsyncThunk<
  SingleTransactionResponse,
  PaymentRequest,
  { rejectValue: string }
>(
  'transactions/receiveResellerPayment',
  async (data: PaymentRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<SingleTransactionResponse>(
        `${API_URL}/topup/reseller/payment`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch dashboard summary (main dashboard data)
export const fetchDashboardSummary = createAsyncThunk<
  DashboardSummaryResponse,
  void,
  { rejectValue: string }
>(
  'transactions/fetchDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<DashboardSummaryResponse>(
        `${API_URL}/topup/dashboard/summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch profit report
export const fetchProfitReport = createAsyncThunk<
  ProfitReportResponse,
  { start_date?: string; end_date?: string } | void,
  { rejectValue: string }
>(
  'transactions/fetchProfitReport',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ProfitReportResponse>(
        `${API_URL}/topup/statistics/profit`,
        {
          params: params || {},
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Fetch supplier stock
export const fetchSupplierStock = createAsyncThunk<
  SupplierStockResponse,
  FetchSupplierStockParams,
  { rejectValue: string }
>(
  'transactions/fetchSupplierStock',
  async ({ supplier_id }: FetchSupplierStockParams, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<SupplierStockResponse>(
        `${API_URL}/topup/supplier/stock/${supplier_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// ==================== Slice ====================

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
    clearDashboardSummary: (state) => {
      state.dashboardSummary = null;
    },
    clearProfitReport: (state) => {
      state.profitReport = null;
    },
    clearSupplierStock: (state) => {
      state.supplierStock = null;
    },
    clearAllData: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== Fetch Transactions ====================
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<TransactionResponse>) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.summary = action.payload.summary;
      })
      .addCase(fetchTransactions.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch transactions';
      })

      // ==================== Fetch Transaction By ID ====================
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action: PayloadAction<SingleTransactionResponse>) => {
        state.loading = false;
        state.selectedTransaction = action.payload.transaction || null;
      })
      .addCase(fetchTransactionById.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch transaction';
      })

      // ==================== Buy Topup ====================
      .addCase(buyTopup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(buyTopup.fulfilled, (state, action: PayloadAction<SingleTransactionResponse>) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      .addCase(buyTopup.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to buy topup';
      })

      // ==================== Sell Topup ====================
      .addCase(sellTopup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sellTopup.fulfilled, (state, action: PayloadAction<SingleTransactionResponse>) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      .addCase(sellTopup.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to sell topup';
      })

      // ==================== Make Supplier Payment ====================
      .addCase(makeSupplierPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeSupplierPayment.fulfilled, (state, action: PayloadAction<SingleTransactionResponse>) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      .addCase(makeSupplierPayment.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to make supplier payment';
      })

      // ==================== Receive Reseller Payment ====================
      .addCase(receiveResellerPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveResellerPayment.fulfilled, (state, action: PayloadAction<SingleTransactionResponse>) => {
        state.loading = false;
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      .addCase(receiveResellerPayment.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to receive reseller payment';
      })

      // ==================== Fetch Dashboard Summary ====================
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action: PayloadAction<DashboardSummaryResponse>) => {
        state.loading = false;
        state.dashboardSummary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch dashboard summary';
      })

      // ==================== Fetch Profit Report ====================
      .addCase(fetchProfitReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitReport.fulfilled, (state, action: PayloadAction<ProfitReportResponse>) => {
        state.loading = false;
        state.profitReport = action.payload;
      })
      .addCase(fetchProfitReport.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profit report';
      })

      // ==================== Fetch Supplier Stock ====================
      .addCase(fetchSupplierStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierStock.fulfilled, (state, action: PayloadAction<SupplierStockResponse>) => {
        state.loading = false;
        state.supplierStock = action.payload;
      })
      .addCase(fetchSupplierStock.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch supplier stock';
      });
  }
});

// ==================== Selectors ====================

export const selectAllTransactions = (state: { transactions: TransactionState }) =>
  state.transactions.transactions;
export const selectSelectedTransaction = (state: { transactions: TransactionState }) =>
  state.transactions.selectedTransaction;
export const selectTransactionsLoading = (state: { transactions: TransactionState }) =>
  state.transactions.loading;
export const selectTransactionsError = (state: { transactions: TransactionState }) =>
  state.transactions.error;
export const selectTransactionsPagination = (state: { transactions: TransactionState }) =>
  state.transactions.pagination;
export const selectTransactionsSummary = (state: { transactions: TransactionState }) =>
  state.transactions.summary;
export const selectDashboardSummary = (state: { transactions: TransactionState }) =>
  state.transactions.dashboardSummary;
export const selectProfitReport = (state: { transactions: TransactionState }) =>
  state.transactions.profitReport;
export const selectSupplierStock = (state: { transactions: TransactionState }) =>
  state.transactions.supplierStock;

// Helper selectors for dashboard data
export const selectTotalProfit = (state: { transactions: TransactionState }) => {
  const dashboard = state.transactions.dashboardSummary;
  return dashboard?.summary?.topup_summary?.profit_analysis?.total_profit || "0.00";
};

export const selectTodayProfit = (state: { transactions: TransactionState }) => {
  const dashboard = state.transactions.dashboardSummary;
  return dashboard?.summary?.today?.profit?.total_profit || "0.00";
};

export const selectTotalRevenue = (state: { transactions: TransactionState }) => {
  const dashboard = state.transactions.dashboardSummary;
  return dashboard?.summary?.topup_summary?.profit_analysis?.total_revenue || "0.00";
};

export const selectCurrentStock = (state: { transactions: TransactionState }) => {
  const dashboard = state.transactions.dashboardSummary;
  return {
    quantity: dashboard?.summary?.topup_summary?.current_stock_quantity || "0.00",
    value: dashboard?.summary?.topup_summary?.current_stock_value || "0.00"
  };
};

// Export actions
export const {
  clearTransactionError,
  clearSelectedTransaction,
  clearDashboardSummary,
  clearProfitReport,
  clearSupplierStock,
  clearAllData
} = transactionSlice.actions;

// Export reducer
export default transactionSlice.reducer;
