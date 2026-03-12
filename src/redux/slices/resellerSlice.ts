// redux/slices/resellerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { 
  IReseller, 
  IResellerCreate, 
  IResellerUpdate, 
  IResellerPercentageUpdate,
  IResellerStatusUpdate,
  IResellerResponse,
  IResellerState 
} from '../../type/reseller';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// Initial state
const initialState: IResellerState = {
  resellers: [],
  selectedReseller: null,
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

// Get all resellers with pagination and search
export const fetchResellers = createAsyncThunk<
  IResellerResponse,
  { page?: number; item_per_page?: number; search?: string } | undefined,
  { rejectValue: string }
>(
  'reseller/fetchResellers',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.item_per_page) queryParams.append('item_per_page', params.item_per_page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${BASE_URL}/resellers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get<IResellerResponse>(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to fetch resellers');
    }
  }
);

// Create new reseller
export const createReseller = createAsyncThunk<
  IResellerResponse,
  IResellerCreate,
  { rejectValue: string }
>(
  'reseller/createReseller',
  async (resellerData, { rejectWithValue }) => {
    try {
      const response = await axios.post<IResellerResponse>(
        `${BASE_URL}/resellers`,
        resellerData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to create reseller');
    }
  }
);

// Update reseller
export const updateReseller = createAsyncThunk<
  IResellerResponse,
  { reseller_id: number; data: IResellerUpdate },
  { rejectValue: string }
>(
  'reseller/updateReseller',
  async ({ reseller_id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put<IResellerResponse>(
        `${BASE_URL}/resellers/${reseller_id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to update reseller');
    }
  }
);

// Update reseller percentage only
export const updateResellerPercentage = createAsyncThunk<
  IResellerResponse,
  { reseller_id: number; data: IResellerPercentageUpdate },
  { rejectValue: string }
>(
  'reseller/updateResellerPercentage',
  async ({ reseller_id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<IResellerResponse>(
        `${BASE_URL}/resellers/percentage/${reseller_id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to update reseller percentage');
    }
  }
);

// Change reseller status
export const changeResellerStatus = createAsyncThunk<
  IResellerResponse,
  { reseller_id: number; data: IResellerStatusUpdate },
  { rejectValue: string }
>(
  'reseller/changeResellerStatus',
  async ({ reseller_id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch<IResellerResponse>(
        `${BASE_URL}/resellers/status/${reseller_id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to change reseller status');
    }
  }
);

// Delete reseller
export const deleteReseller = createAsyncThunk<
  { reseller_id: number; message: string },
  number,
  { rejectValue: string }
>(
  'reseller/deleteReseller',
  async (reseller_id, { rejectWithValue }) => {
    try {
      const response = await axios.delete<{ status: boolean; message: string }>(
        `${BASE_URL}/resellers/${reseller_id}`,
        getAuthHeaders()
      );
      return { reseller_id, message: response.data.message };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Failed to delete reseller');
    }
  }
);

// ==================== Slice ====================

const resellerSlice = createSlice({
  name: 'reseller',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedReseller: (state, action: PayloadAction<IReseller | null>) => {
      state.selectedReseller = action.payload;
    },
    clearResellers: (state) => {
      state.resellers = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Resellers
    builder
      .addCase(fetchResellers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResellers.fulfilled, (state, action: PayloadAction<IResellerResponse>) => {
        state.isLoading = false;
        state.resellers = action.payload.resellers || [];
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchResellers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch resellers';
      })

    // Create Reseller
    builder
      .addCase(createReseller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReseller.fulfilled, (state, action: PayloadAction<IResellerResponse>) => {
        state.isLoading = false;
        if (action.payload.reseller) {
          state.resellers = [action.payload.reseller, ...state.resellers];
        }
        state.error = null;
      })
      .addCase(createReseller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create reseller';
      })

    // Update Reseller
    builder
      .addCase(updateReseller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReseller.fulfilled, (state, action: PayloadAction<IResellerResponse>) => {
        state.isLoading = false;
        if (action.payload.reseller) {
          const index = state.resellers.findIndex(r => r.id === action.payload.reseller!.id);
          if (index !== -1) {
            state.resellers[index] = action.payload.reseller;
          }
          if (state.selectedReseller?.id === action.payload.reseller.id) {
            state.selectedReseller = action.payload.reseller;
          }
        }
        state.error = null;
      })
      .addCase(updateReseller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update reseller';
      })

    // Update Reseller Percentage
    builder
      .addCase(updateResellerPercentage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResellerPercentage.fulfilled, (state, action: PayloadAction<IResellerResponse>) => {
        state.isLoading = false;
        if (action.payload.reseller) {
          const index = state.resellers.findIndex(r => r.id === action.payload.reseller!.id);
          if (index !== -1) {
            state.resellers[index] = action.payload.reseller;
          }
          if (state.selectedReseller?.id === action.payload.reseller.id) {
            state.selectedReseller = action.payload.reseller;
          }
        }
        state.error = null;
      })
      .addCase(updateResellerPercentage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update reseller percentage';
      })

    // Change Reseller Status
    builder
      .addCase(changeResellerStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changeResellerStatus.fulfilled, (state, action: PayloadAction<IResellerResponse>) => {
        state.isLoading = false;
        if (action.payload.reseller) {
          const index = state.resellers.findIndex(r => r.id === action.payload.reseller!.id);
          if (index !== -1) {
            state.resellers[index] = action.payload.reseller;
          }
          if (state.selectedReseller?.id === action.payload.reseller.id) {
            state.selectedReseller = action.payload.reseller;
          }
        }
        state.error = null;
      })
      .addCase(changeResellerStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to change reseller status';
      })

    // Delete Reseller
    builder
      .addCase(deleteReseller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReseller.fulfilled, (state, action: PayloadAction<{ reseller_id: number; message: string }>) => {
        state.isLoading = false;
        state.resellers = state.resellers.filter(r => r.id !== action.payload.reseller_id);
        if (state.selectedReseller?.id === action.payload.reseller_id) {
          state.selectedReseller = null;
        }
        state.error = null;
      })
      .addCase(deleteReseller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete reseller';
      });
  },
});

// ==================== Exports ====================

export const { clearError, setSelectedReseller, clearResellers } = resellerSlice.actions;

// Selectors - Fixed to match Supplier pattern (using state.reseller instead of RootState)
export const selectAllResellers = (state: { reseller: IResellerState }) => state.reseller.resellers;
export const selectSelectedReseller = (state: { reseller: IResellerState }) => state.reseller.selectedReseller;
export const selectResellerLoading = (state: { reseller: IResellerState }) => state.reseller.isLoading;
export const selectResellerError = (state: { reseller: IResellerState }) => state.reseller.error;
export const selectResellerPagination = (state: { reseller: IResellerState }) => state.reseller.pagination;

export default resellerSlice.reducer;