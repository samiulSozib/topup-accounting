// redux/slices/supplierSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { 
  ISupplier, 
  ISupplierCreate, 
  ISupplierUpdate, 
  ISupplierPercentageUpdate,
  ISupplierStatusUpdate,
  ISupplierResponse,
  ISupplierState 
} from '../../type/supplier';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// Initial state
const initialState: ISupplierState = {
  suppliers: [],
  selectedSupplier: null,
  isLoading: false,
  error: null,
  pagination: null,
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

// Get all suppliers with pagination and search
export const fetchSuppliers = createAsyncThunk<
  ISupplierResponse,
  { page?: number; item_per_page?: number; search?: string } | undefined,
  { rejectValue: string }
>(
  'supplier/fetchSuppliers',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.item_per_page) queryParams.append('item_per_page', params.item_per_page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${BASE_URL}/suppliers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get<ISupplierResponse>(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch suppliers');
    }
  }
);

// Create new supplier
export const createSupplier = createAsyncThunk<
  ISupplierResponse,
  ISupplierCreate,
  { rejectValue: string }
>(
  'supplier/createSupplier',
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await axios.post<ISupplierResponse>(
        `${BASE_URL}/suppliers`,
        supplierData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to create supplier');
    }
  }
);

// Update supplier
export const updateSupplier = createAsyncThunk<
  ISupplierResponse,
  { supplier_id: number; data: ISupplierUpdate },
  { rejectValue: string }
>(
  'supplier/updateSupplier',
  async ({ supplier_id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put<ISupplierResponse>(
        `${BASE_URL}/suppliers/${supplier_id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to update supplier');
    }
  }
);

// Update supplier percentage only
export const updateSupplierPercentage = createAsyncThunk<
  ISupplierResponse,
  { supplier_id: number; data: ISupplierPercentageUpdate },
  { rejectValue: string }
>(
  'supplier/updateSupplierPercentage',
  async ({ supplier_id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<ISupplierResponse>(
        `${BASE_URL}/suppliers/percentage/${supplier_id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to update supplier percentage');
    }
  }
);

// Change supplier status
export const changeSupplierStatus = createAsyncThunk<
  ISupplierResponse,
  { supplier_id: number; data: ISupplierStatusUpdate },
  { rejectValue: string }
>(
  'supplier/changeSupplierStatus',
  async ({ supplier_id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<ISupplierResponse>(
        `${BASE_URL}/suppliers/status/${supplier_id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to change supplier status');
    }
  }
);

// Delete supplier
export const deleteSupplier = createAsyncThunk<
  { supplier_id: number; message: string },
  number,
  { rejectValue: string }
>(
  'supplier/deleteSupplier',
  async (supplier_id, { rejectWithValue }) => {
    try {
      const response = await axios.delete<{ status: boolean; message: string }>(
        `${BASE_URL}/suppliers/${supplier_id}`,
        getAuthHeaders()
      );
      return { supplier_id, message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to delete supplier');
    }
  }
);

// ==================== Slice ====================

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSupplier: (state, action: PayloadAction<ISupplier | null>) => {
      state.selectedSupplier = action.payload;
    },
    clearSuppliers: (state) => {
      state.suppliers = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Suppliers
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action: PayloadAction<ISupplierResponse>) => {
        state.isLoading = false;
        state.suppliers = action.payload.suppliers || [];
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch suppliers';
      })

    // Create Supplier
    builder
      .addCase(createSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action: PayloadAction<ISupplierResponse>) => {
        state.isLoading = false;
        if (action.payload.supplier) {
          state.suppliers = [action.payload.supplier, ...state.suppliers];
        }
        state.error = null;
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create supplier';
      })

    // Update Supplier
    builder
      .addCase(updateSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action: PayloadAction<ISupplierResponse>) => {
        state.isLoading = false;
        if (action.payload.supplier) {
          const index = state.suppliers.findIndex(s => s.id === action.payload.supplier!.id);
          if (index !== -1) {
            state.suppliers[index] = action.payload.supplier;
          }
          if (state.selectedSupplier?.id === action.payload.supplier.id) {
            state.selectedSupplier = action.payload.supplier;
          }
        }
        state.error = null;
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update supplier';
      })

    // Update Supplier Percentage
    builder
      .addCase(updateSupplierPercentage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupplierPercentage.fulfilled, (state, action: PayloadAction<ISupplierResponse>) => {
        state.isLoading = false;
        if (action.payload.supplier) {
          const index = state.suppliers.findIndex(s => s.id === action.payload.supplier!.id);
          if (index !== -1) {
            state.suppliers[index] = action.payload.supplier;
          }
          if (state.selectedSupplier?.id === action.payload.supplier.id) {
            state.selectedSupplier = action.payload.supplier;
          }
        }
        state.error = null;
      })
      .addCase(updateSupplierPercentage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update supplier percentage';
      })

    // Change Supplier Status
    builder
      .addCase(changeSupplierStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeSupplierStatus.fulfilled, (state, action: PayloadAction<ISupplierResponse>) => {
        state.isLoading = false;
        if (action.payload.supplier) {
          const index = state.suppliers.findIndex(s => s.id === action.payload.supplier!.id);
          if (index !== -1) {
            state.suppliers[index] = action.payload.supplier;
          }
          if (state.selectedSupplier?.id === action.payload.supplier.id) {
            state.selectedSupplier = action.payload.supplier;
          }
        }
        state.error = null;
      })
      .addCase(changeSupplierStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to change supplier status';
      })

    // Delete Supplier
    builder
      .addCase(deleteSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action: PayloadAction<{ supplier_id: number; message: string }>) => {
        state.isLoading = false;
        state.suppliers = state.suppliers.filter(s => s.id !== action.payload.supplier_id);
        if (state.selectedSupplier?.id === action.payload.supplier_id) {
          state.selectedSupplier = null;
        }
        state.error = null;
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete supplier';
      });
  },
});

// ==================== Exports ====================

export const { clearError, setSelectedSupplier, clearSuppliers } = supplierSlice.actions;

// Selectors
export const selectAllSuppliers = (state: { supplier: ISupplierState }) => state.supplier.suppliers;
export const selectSelectedSupplier = (state: { supplier: ISupplierState }) => state.supplier.selectedSupplier;
export const selectSupplierLoading = (state: { supplier: ISupplierState }) => state.supplier.isLoading;
export const selectSupplierError = (state: { supplier: ISupplierState }) => state.supplier.error;
export const selectSupplierPagination = (state: { supplier: ISupplierState }) => state.supplier.pagination;

export default supplierSlice.reducer;