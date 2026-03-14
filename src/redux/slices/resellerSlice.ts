// store/slices/resellerSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  Reseller,
  ResellerResponse,
  SingleResellerResponse,
  ResellerStatisticsResponse,
  CreateResellerRequest,
  UpdateResellerRequest,
  Pagination
} from '../../type';
import { ApiError } from '../../type/api';

const API_URL = import.meta.env.VITE_BASE_URL || '';


interface ResellerState {
  resellers: Reseller[];
  selectedReseller: Reseller | null;
  resellerStatistics: ResellerStatisticsResponse | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: ResellerState = {
  resellers: [],
  selectedReseller: null,
  resellerStatistics: null,
  loading: false,
  error: null,
  pagination: null
};

interface FetchResellersParams {
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

interface UpdateResellerData {
  id: number;
  data: UpdateResellerRequest;
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
export const fetchResellers = createAsyncThunk<
  ResellerResponse,
  FetchResellersParams,
  { rejectValue: string }
>(
  'resellers/fetchResellers',
  async ({ page = 1, item_per_page = 20, search = '' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ResellerResponse>(`${API_URL}/resellers`, {
        params: { page, item_per_page, search },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchResellerById = createAsyncThunk<
  SingleResellerResponse,
  number,
  { rejectValue: string }
>(
  'resellers/fetchResellerById',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<SingleResellerResponse>(`${API_URL}/resellers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchResellerStatistics = createAsyncThunk<
  ResellerStatisticsResponse,
  FetchStatisticsParams,
  { rejectValue: string }
>(
  'resellers/fetchResellerStatistics',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<ResellerStatisticsResponse>(
        `${API_URL}/topup/reseller/statistics/${id}`,
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

export const createReseller = createAsyncThunk<
  SingleResellerResponse,
  CreateResellerRequest,
  { rejectValue: string }
>(
  'resellers/createReseller',
  async (resellerData: CreateResellerRequest, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<SingleResellerResponse>(`${API_URL}/resellers`, resellerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateReseller = createAsyncThunk<
  SingleResellerResponse,
  UpdateResellerData,
  { rejectValue: string }
>(
  'resellers/updateReseller',
  async ({ id, data }: UpdateResellerData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put<SingleResellerResponse>(`${API_URL}/resellers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateResellerPercentage = createAsyncThunk<
  SingleResellerResponse,
  UpdatePercentageData,
  { rejectValue: string }
>(
  'resellers/updateResellerPercentage',
  async ({ id, bonus_percentage }: UpdatePercentageData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch<SingleResellerResponse>(
        `${API_URL}/resellers/${id}/percentage`,
        { bonus_percentage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const changeResellerStatus = createAsyncThunk<
  SingleResellerResponse,
  number,
  { rejectValue: string }
>(
  'resellers/changeResellerStatus',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch<SingleResellerResponse>(
        `${API_URL}/resellers/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteReseller = createAsyncThunk<
  { id: number; message: string },
  number,
  { rejectValue: string }
>(
  'resellers/deleteReseller',
  async (id: number, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete<DeleteResponse>(
        `${API_URL}/resellers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const resellerSlice = createSlice({
  name: 'resellers',
  initialState,
  reducers: {
    clearResellerError: (state) => {
      state.error = null;
    },
    clearSelectedReseller: (state) => {
      state.selectedReseller = null;
    },
    clearResellerStatistics: (state) => {
      state.resellerStatistics = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Resellers
      .addCase(fetchResellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResellers.fulfilled, (state, action: PayloadAction<ResellerResponse>) => {
        state.loading = false;
        state.resellers = action.payload.resellers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchResellers.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch resellers';
      })

      // Fetch Reseller By Id
      .addCase(fetchResellerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResellerById.fulfilled, (state, action: PayloadAction<SingleResellerResponse>) => {
        state.loading = false;
        state.selectedReseller = action.payload.reseller;
      })
      .addCase(fetchResellerById.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reseller';
      })

      // Fetch Reseller Statistics
      .addCase(fetchResellerStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResellerStatistics.fulfilled, (state, action: PayloadAction<ResellerStatisticsResponse>) => {
        state.loading = false;
        state.resellerStatistics = action.payload;
      })
      .addCase(fetchResellerStatistics.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reseller statistics';
      })

      // Create Reseller
      .addCase(createReseller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReseller.fulfilled, (state, action: PayloadAction<SingleResellerResponse>) => {
        state.loading = false;
        state.resellers.unshift(action.payload.reseller);
      })
      .addCase(createReseller.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create reseller';
      })

      // Update Reseller
      .addCase(updateReseller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReseller.fulfilled, (state, action: PayloadAction<SingleResellerResponse>) => {
        state.loading = false;
        const index = state.resellers.findIndex(r => r.id === action.payload.reseller.id);
        if (index !== -1) {
          state.resellers[index] = action.payload.reseller;
        }
        if (state.selectedReseller?.id === action.payload.reseller.id) {
          state.selectedReseller = action.payload.reseller;
        }
      })
      .addCase(updateReseller.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update reseller';
      })

      // Update Reseller Percentage
      .addCase(updateResellerPercentage.fulfilled, (state, action: PayloadAction<SingleResellerResponse>) => {
        const index = state.resellers.findIndex(r => r.id === action.payload.reseller.id);
        if (index !== -1) {
          state.resellers[index] = action.payload.reseller;
        }
        if (state.selectedReseller?.id === action.payload.reseller.id) {
          state.selectedReseller = action.payload.reseller;
        }
      })
      .addCase(updateResellerPercentage.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to update reseller percentage';
      })

      // Change Reseller Status
      .addCase(changeResellerStatus.fulfilled, (state, action: PayloadAction<SingleResellerResponse>) => {
        const index = state.resellers.findIndex(r => r.id === action.payload.reseller.id);
        if (index !== -1) {
          state.resellers[index] = action.payload.reseller;
        }
        if (state.selectedReseller?.id === action.payload.reseller.id) {
          state.selectedReseller = action.payload.reseller;
        }
      })
      .addCase(changeResellerStatus.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || 'Failed to change reseller status';
      })

      // Delete Reseller
      .addCase(deleteReseller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReseller.fulfilled, (state, action: PayloadAction<{ id: number; message: string }>) => {
        state.loading = false;
        state.resellers = state.resellers.filter(r => r.id !== action.payload.id);
        if (state.selectedReseller?.id === action.payload.id) {
          state.selectedReseller = null;
        }
      })
      .addCase(deleteReseller.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete reseller';
      });
  }
});

export const { 
  clearResellerError, 
  clearSelectedReseller, 
  clearResellerStatistics 
} = resellerSlice.actions;

export default resellerSlice.reducer;