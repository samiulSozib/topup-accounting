// store/slices/supplierSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  Supplier,
  SupplierResponse,
  SingleSupplierResponse,
  SupplierStatisticsResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  Pagination
} from '../../type';
import { ApiError } from '../../type/api';

const API_URL = import.meta.env.VITE_BASE_URL || '';

interface SupplierState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  supplierStatistics: SupplierStatisticsResponse | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: SupplierState = {
  suppliers: [],
  selectedSupplier: null,
  supplierStatistics: null,
  loading: false,
  error: null,
  pagination: null
};

interface FetchSuppliersParams {
  page?: number;
  item_per_page?: number;
  search?: string;
}

interface FetchStatisticsParams {
  id: number;
  params?: {
    page?: number;
    limit?: number;
    recent_count?: number;
    show_all?: boolean;
  };
}

interface UpdateSupplierData {
  id: number;
  data: UpdateSupplierRequest;
}

interface UpdatePercentageData {
  id: number;
  bonus_percentage: number;
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
export const fetchSuppliers = createAsyncThunk<
  SupplierResponse,
  FetchSuppliersParams,
  { rejectValue: string }
>(
  'suppliers/fetchSuppliers',
  async ({ page = 1, item_per_page = 20, search = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<SupplierResponse>(`${API_URL}/suppliers`, {
        params: { page, item_per_page, search },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchSupplierById = createAsyncThunk<
  SingleSupplierResponse,
  number,
  { rejectValue: string }
>(
  'suppliers/fetchSupplierById',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<SingleSupplierResponse>(`${API_URL}/suppliers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchSupplierStatistics = createAsyncThunk<
  SupplierStatisticsResponse,
  FetchStatisticsParams,
  { rejectValue: string }
>(
  'suppliers/fetchSupplierStatistics',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<SupplierStatisticsResponse>(
        `${API_URL}/topup/supplier/statistics/${id}`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createSupplier = createAsyncThunk<
  SingleSupplierResponse,
  CreateSupplierRequest,
  { rejectValue: string }
>(
  'suppliers/createSupplier',
  async (supplierData: CreateSupplierRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<SingleSupplierResponse>(`${API_URL}/suppliers`, supplierData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateSupplier = createAsyncThunk<
  SingleSupplierResponse,
  UpdateSupplierData,
  { rejectValue: string }
>(
  'suppliers/updateSupplier',
  async ({ id, data }: UpdateSupplierData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<SingleSupplierResponse>(`${API_URL}/suppliers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateSupplierPercentage = createAsyncThunk<
  SingleSupplierResponse,
  UpdatePercentageData,
  { rejectValue: string }
>(
  'suppliers/updateSupplierPercentage',
  async ({ id, bonus_percentage }: UpdatePercentageData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch<SingleSupplierResponse>(
        `${API_URL}/suppliers/${id}/percentage`,
        { bonus_percentage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const changeSupplierStatus = createAsyncThunk<
  SingleSupplierResponse,
  number,
  { rejectValue: string }
>(
  'suppliers/changeSupplierStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch<SingleSupplierResponse>(
        `${API_URL}/suppliers/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteSupplier = createAsyncThunk<
  { id: number; message: string },
  number,
  { rejectValue: string }
>(
  'suppliers/deleteSupplier',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete<DeleteResponse>(
        `${API_URL}/suppliers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const supplierSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    clearSupplierError: (state) => {
      state.error = null;
    },
    clearSelectedSupplier: (state) => {
      state.selectedSupplier = null;
    },
    clearSupplierStatistics: (state) => {
      state.supplierStatistics = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<SupplierResponse>) => {
        state.loading = false;
        state.suppliers = action.payload.suppliers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSuppliers.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch suppliers';
      })

      // Fetch Supplier By Id
      .addCase(fetchSupplierById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action: PayloadAction<SingleSupplierResponse>) => {
        state.loading = false;
        state.selectedSupplier = action.payload.supplier;
      })
      .addCase(fetchSupplierById.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch supplier';
      })

      // Fetch Supplier Statistics
      .addCase(fetchSupplierStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierStatistics.fulfilled, (state, action: PayloadAction<SupplierStatisticsResponse>) => {
        state.loading = false;
        state.supplierStatistics = action.payload;
      })
      .addCase(fetchSupplierStatistics.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch supplier statistics';
      })

      // Create Supplier
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action: PayloadAction<SingleSupplierResponse>) => {
        state.loading = false;
        state.suppliers.unshift(action.payload.supplier);
      })
      .addCase(createSupplier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create supplier';
      })

      // Update Supplier
      .addCase(updateSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action: PayloadAction<SingleSupplierResponse>) => {
        state.loading = false;
        const index = state.suppliers.findIndex(s => s.id === action.payload.supplier.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload.supplier;
        }
        if (state.selectedSupplier?.id === action.payload.supplier.id) {
          state.selectedSupplier = action.payload.supplier;
        }
      })
      .addCase(updateSupplier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update supplier';
      })

      // Update Supplier Percentage
      .addCase(updateSupplierPercentage.fulfilled, (state, action: PayloadAction<SingleSupplierResponse>) => {
        const index = state.suppliers.findIndex(s => s.id === action.payload.supplier.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload.supplier;
        }
        if (state.selectedSupplier?.id === action.payload.supplier.id) {
          state.selectedSupplier = action.payload.supplier;
        }
      })
      .addCase(updateSupplierPercentage.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to update supplier percentage';
      })

      // Change Supplier Status
      .addCase(changeSupplierStatus.fulfilled, (state, action: PayloadAction<SingleSupplierResponse>) => {
        const index = state.suppliers.findIndex(s => s.id === action.payload.supplier.id);
        if (index !== -1) {
          state.suppliers[index] = action.payload.supplier;
        }
        if (state.selectedSupplier?.id === action.payload.supplier.id) {
          state.selectedSupplier = action.payload.supplier;
        }
      })
      .addCase(changeSupplierStatus.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to change supplier status';
      })

      // Delete Supplier
      .addCase(deleteSupplier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action: PayloadAction<{ id: number; message: string }>) => {
        state.loading = false;
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload.id);
        if (state.selectedSupplier?.id === action.payload.id) {
          state.selectedSupplier = null;
        }
      })
      .addCase(deleteSupplier.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete supplier';
      });
  }
});

export const { 
  clearSupplierError, 
  clearSelectedSupplier, 
  clearSupplierStatistics 
} = supplierSlice.actions;

export default supplierSlice.reducer;