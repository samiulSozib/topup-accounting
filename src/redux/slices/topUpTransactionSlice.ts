// redux/slices/topUpTransactionSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import {
  ITopUpTransaction,
  IBuyTopupRequest,
  ISellTopupRequest,
  IMonthlyTransactionsQuery,
  IStockQuery,
  ITransactionResponse,
  ITransactionsState,
  ITransactionFilters,
  ISupplierStatisticsResponse,
  IResellerStatisticsResponse,
  IProfitStatisticsResponse,
  ISupplierPaymentResponse,
  ISupplierDuePaymentRequest,
  IResellerDueCollectionRequest,
  IResellerCollectionResponse
} from '../../type/topUpTransaction';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// Initial state
const initialState: ITransactionsState = {
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  error: null,
  monthlyTransactions: [],
  currentStock: null,
  supplierStatistics: null,
  resellerStatistics: null,
  profitStatistics: null,
};

interface ErrorResponse {
  message?: string;
}

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ==================== Async Thunks ====================

// Buy Topup from Supplier
export const buyTopupFromSupplier = createAsyncThunk<
  ITransactionResponse,
  IBuyTopupRequest,
  { rejectValue: string }
>(
  'topup/buyFromSupplier',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post<ITransactionResponse>(
        `${BASE_URL}/topup/supplier/buy`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to buy topup');
    }
  }
);

// Sell Topup to Reseller
export const sellTopupToReseller = createAsyncThunk<
  ITransactionResponse,
  ISellTopupRequest,
  { rejectValue: string }
>(
  'topup/sellToReseller',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post<ITransactionResponse>(
        `${BASE_URL}/topup/reseller/sell`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to sell topup');
    }
  }
);

// Supplier Due Payment
export const makeSupplierDuePayment = createAsyncThunk<
  ISupplierPaymentResponse,
  ISupplierDuePaymentRequest,
  { rejectValue: string }
>(
  'topup/supplierDuePayment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post<ISupplierPaymentResponse>(
        `${BASE_URL}/topup/supplier/payment`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to record supplier payment');
    }
  }
);

// Reseller Collection
export const makeResellerCollection = createAsyncThunk<
  IResellerCollectionResponse,
  IResellerDueCollectionRequest,
  { rejectValue: string }
>(
  'topup/resellerCollection',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post<IResellerCollectionResponse>(
        `${BASE_URL}/topup/reseller/collection`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to record reseller collection');
    }
  }
);

// Get All Transactions with filters
export const fetchAllTransactions = createAsyncThunk<
  ITransactionResponse,
  ITransactionFilters | undefined,
  { rejectValue: string }
>(
  'topup/fetchAllTransactions',
  async (filters, { rejectWithValue }) => {
    try {
      let url = `${BASE_URL}/topup/transactions`;
      
      if (filters) {
        const queryParams = new URLSearchParams();
        
        if (filters.transaction_type) {
          queryParams.append('transaction_type', filters.transaction_type);
        }
        
        if (filters.supplier_id) {
          queryParams.append('supplier_id', filters.supplier_id.toString());
        }
        
        if (filters.reseller_id) {
          queryParams.append('reseller_id', filters.reseller_id.toString());
        }
        
        if (filters.search) {
          queryParams.append('search', filters.search);
        }
        
        if (filters.min_amount) {
          queryParams.append('min_amount', filters.min_amount.toString());
        }
        
        if (filters.max_amount) {
          queryParams.append('max_amount', filters.max_amount.toString());
        }
        
        if (filters.start_date) {
          queryParams.append('start_date', filters.start_date);
        }
        
        if (filters.end_date) {
          queryParams.append('end_date', filters.end_date);
        }
        
        if (filters.page) {
          queryParams.append('page', filters.page.toString());
        }
        
        if (filters.limit) {
          queryParams.append('limit', filters.limit.toString());
        }
        
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }
      
      const response = await axios.get<ITransactionResponse>(
        url,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Get Monthly Transactions
export const fetchMonthlyTransactions = createAsyncThunk<
  ITransactionResponse,
  IMonthlyTransactionsQuery,
  { rejectValue: string }
>(
  'topup/fetchMonthlyTransactions',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await axios.get<ITransactionResponse>(
        `${BASE_URL}/topup/monthly?month=${month}&year=${year}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch monthly transactions');
    }
  }
);

// Get Current Stock
export const fetchCurrentStock = createAsyncThunk<
  { stock: number },
  IStockQuery,
  { rejectValue: string }
>(
  'topup/fetchCurrentStock',
  async ({ supplier_id }, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ stock: number }>(
        `${BASE_URL}/topup/stock?supplier_id=${supplier_id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch stock');
    }
  }
);

// Get Supplier Statistics
export const fetchSupplierStatistics = createAsyncThunk<
  ISupplierStatisticsResponse,
  number,
  { rejectValue: string }
>(
  'topup/fetchSupplierStatistics',
  async (supplier_id, { rejectWithValue }) => {
    try {
      const response = await axios.get<ISupplierStatisticsResponse>(
        `${BASE_URL}/topup/supplier/${supplier_id}/statistics`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch supplier statistics');
    }
  }
);

// Get Reseller Statistics
export const fetchResellerStatistics = createAsyncThunk<
  IResellerStatisticsResponse,
  number,
  { rejectValue: string }
>(
  'topup/fetchResellerStatistics',
  async (reseller_id, { rejectWithValue }) => {
    try {
      const response = await axios.get<IResellerStatisticsResponse>(
        `${BASE_URL}/topup/reseller/${reseller_id}/statistics`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch reseller statistics');
    }
  }
);

// Get Profit Statistics
export const fetchProfitStatistics = createAsyncThunk<
  IProfitStatisticsResponse,
  void,
  { rejectValue: string }
>(
  'topup/fetchProfitStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<IProfitStatisticsResponse>(
        `${BASE_URL}/topup/profit/statistics`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch profit statistics');
    }
  }
);

// ==================== Slice ====================

const topupSlice = createSlice({
  name: 'topup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTransaction: (state, action: PayloadAction<ITopUpTransaction | null>) => {
      state.selectedTransaction = action.payload;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.monthlyTransactions = [];
      state.selectedTransaction = null;
      state.currentStock = null;
      state.supplierStatistics = null;
      state.resellerStatistics = null;
      state.profitStatistics = null;
    },
    clearCurrentStock: (state) => {
      state.currentStock = null;
    },
    clearStatistics: (state) => {
      state.supplierStatistics = null;
      state.resellerStatistics = null;
      state.profitStatistics = null;
    },
  },
  extraReducers: (builder) => {
    // Buy Topup from Supplier
    builder
      .addCase(buyTopupFromSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(buyTopupFromSupplier.fulfilled, (state, action: PayloadAction<ITransactionResponse>) => {
        state.isLoading = false;
        if (action.payload.transaction) {
          state.transactions = [action.payload.transaction, ...state.transactions];
        }
        state.error = null;
      })
      .addCase(buyTopupFromSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to buy topup';
      });

    // Sell Topup to Reseller
    builder
      .addCase(sellTopupToReseller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sellTopupToReseller.fulfilled, (state, action: PayloadAction<ITransactionResponse>) => {
        state.isLoading = false;
        if (action.payload.transaction) {
          state.transactions = [action.payload.transaction, ...state.transactions];
        }
        state.error = null;
      })
      .addCase(sellTopupToReseller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to sell topup';
      });

    // Supplier Due Payment - Note: This doesn't add a transaction to the list
    builder
      .addCase(makeSupplierDuePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(makeSupplierDuePayment.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(makeSupplierDuePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to record supplier payment';
      });

    // Reseller Collection - Note: This doesn't add a transaction to the list
    builder
      .addCase(makeResellerCollection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(makeResellerCollection.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(makeResellerCollection.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to record reseller collection';
      });

    // Fetch All Transactions
    builder
      .addCase(fetchAllTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action: PayloadAction<ITransactionResponse>) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions || [];
        state.error = null;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch transactions';
      });

    // Fetch Monthly Transactions
    builder
      .addCase(fetchMonthlyTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyTransactions.fulfilled, (state, action: PayloadAction<ITransactionResponse>) => {
        state.isLoading = false;
        state.monthlyTransactions = action.payload.transactions || [];
        state.error = null;
      })
      .addCase(fetchMonthlyTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch monthly transactions';
      });

    // Fetch Current Stock
    builder
      .addCase(fetchCurrentStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentStock.fulfilled, (state, action: PayloadAction<{ stock: number }>) => {
        state.isLoading = false;
        state.currentStock = action.payload.stock;
        state.error = null;
      })
      .addCase(fetchCurrentStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch stock';
      });

    // Fetch Supplier Statistics
    builder
      .addCase(fetchSupplierStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupplierStatistics.fulfilled, (state, action: PayloadAction<ISupplierStatisticsResponse>) => {
        state.isLoading = false;
        state.supplierStatistics = action.payload;
        state.error = null;
      })
      .addCase(fetchSupplierStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch supplier statistics';
      });

    // Fetch Reseller Statistics
    builder
      .addCase(fetchResellerStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResellerStatistics.fulfilled, (state, action: PayloadAction<IResellerStatisticsResponse>) => {
        state.isLoading = false;
        state.resellerStatistics = action.payload;
        state.error = null;
      })
      .addCase(fetchResellerStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch reseller statistics';
      });

    // Fetch Profit Statistics
    builder
      .addCase(fetchProfitStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfitStatistics.fulfilled, (state, action: PayloadAction<IProfitStatisticsResponse>) => {
        state.isLoading = false;
        state.profitStatistics = action.payload;
        state.error = null;
      })
      .addCase(fetchProfitStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch profit statistics';
      });
  },
});

// ==================== Exports ====================

export const {
  clearError,
  setSelectedTransaction,
  clearTransactions,
  clearCurrentStock,
  clearStatistics
} = topupSlice.actions;

// Selectors
export const selectAllTransactions = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.transactions;
export const selectMonthlyTransactions = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.monthlyTransactions;
export const selectSelectedTransaction = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.selectedTransaction;
export const selectTransactionsLoading = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.isLoading;
export const selectTransactionsError = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.error;
export const selectCurrentStock = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.currentStock;
export const selectSupplierStatistics = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.supplierStatistics;
export const selectResellerStatistics = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.resellerStatistics;
export const selectProfitStatistics = (state: { topUpTransactions: ITransactionsState }) => state.topUpTransactions.profitStatistics;

export default topupSlice.reducer;