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
  ProfitStatisticsResponse,
  DashboardSummaryResponse,
  SupplierStockResponse,
  Pagination
} from '../../type';
import { ApiError } from '../../type/api';

const API_URL = import.meta.env.VITE_BASE_URL || '';

interface TransactionState {
  transactions: TopUpTransaction[];
  selectedTransaction: TopUpTransaction | null;
  profitStatistics: ProfitStatisticsResponse | null;
  dashboardSummary: DashboardSummaryResponse | null;
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
  profitStatistics: null,
  dashboardSummary: null,
  supplierStock: null,
  loading: false,
  error: null,
  pagination: null,
  summary: null
};

interface FetchSupplierStockParams {
  supplier_id: number;
}

interface DeleteResponse {
  status: boolean;
  message: string;
}

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || apiError.message || 'An unexpected error occurred';
};

// Async Thunks
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

export const fetchProfitStatistics = createAsyncThunk<
  ProfitStatisticsResponse,
  void,
  { rejectValue: string }
>(
  'transactions/fetchProfitStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ProfitStatisticsResponse>(
        `${API_URL}/topup/statistics/profit`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

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

// Slice
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
    clearProfitStatistics: (state) => {
      state.profitStatistics = null;
    },
    clearDashboardSummary: (state) => {
      state.dashboardSummary = null;
    },
    clearSupplierStock: (state) => {
      state.supplierStock = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
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

      // Buy Topup
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

      // Sell Topup
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

      // Supplier Payment
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

      // Reseller Payment
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

      // Fetch Profit Statistics
      .addCase(fetchProfitStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitStatistics.fulfilled, (state, action: PayloadAction<ProfitStatisticsResponse>) => {
        state.loading = false;
        state.profitStatistics = action.payload;
      })
      .addCase(fetchProfitStatistics.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch profit statistics';
      })

      // Fetch Dashboard Summary
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

      // Fetch Supplier Stock
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

export const {
  clearTransactionError,
  clearSelectedTransaction,
  clearProfitStatistics,
  clearDashboardSummary,
  clearSupplierStock
} = transactionSlice.actions;

export default transactionSlice.reducer;