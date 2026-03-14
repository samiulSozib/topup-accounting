// store/slices/subscriptionPackageSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  SubscriptionPackage, 
  SubscriptionPackagesResponse, 
  SubscriptionPackageParams
} from '../../type/subscriptionPackage';
import { ApiError } from '../../type/api';

const API_URL = import.meta.env.VITE_BASE_URL || '';

interface SubscriptionPackageState {
  packages: SubscriptionPackage[];
  selectedPackage: SubscriptionPackage | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total_items: number;
    total_pages: number;
    current_page: number;
    item_per_page: number;
  } | null;
}

const initialState: SubscriptionPackageState = {
  packages: [],
  selectedPackage: null,
  loading: false,
  error: null,
  pagination: null
};

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || apiError.message || 'An unexpected error occurred';
};

// Async Thunks
export const fetchSubscriptionPackages = createAsyncThunk<
  SubscriptionPackagesResponse,
  SubscriptionPackageParams | undefined,
  { rejectValue: string }
>(
  'subscriptionPackages/fetchPackages',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get<SubscriptionPackagesResponse>(
        `${API_URL}/subscription-packages`,
        {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 20,
            ...(params?.is_active !== undefined && { is_active: params.is_active }),
            ...(params?.is_featured !== undefined && { is_featured: params.is_featured }),
            ...(params?.web_access !== undefined && { web_access: params.web_access }),
            ...(params?.mobile_access !== undefined && { mobile_access: params.mobile_access }),
            ...(params?.duration_type && { duration_type: params.duration_type }),
            ...(params?.sort_by && { sort_by: params.sort_by }),
            ...(params?.sort_order && { sort_order: params.sort_order }),
            ...(params?.search && { search: params.search })
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const subscriptionPackageSlice = createSlice({
  name: 'subscriptionPackages',
  initialState,
  reducers: {
    clearSubscriptionPackageError: (state) => {
      state.error = null;
    },
    clearSelectedPackage: (state) => {
      state.selectedPackage = null;
    },
    resetSubscriptionPackageState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch Packages
      .addCase(fetchSubscriptionPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPackages.fulfilled, (state, action: PayloadAction<SubscriptionPackagesResponse>) => {
        state.loading = false;
        state.packages = action.payload.packages;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSubscriptionPackages.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch subscription packages';
      });
  }
});

// Selectors
export const selectAllPackages = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.packages;
export const selectFeaturedPackages = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.packages.filter(pkg => pkg.is_featured);
export const selectWebPackages = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.packages.filter(pkg => pkg.web_access);
export const selectMobilePackages = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.packages.filter(pkg => pkg.mobile_access);
export const selectBothPlatformPackages = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.packages.filter(pkg => pkg.web_access && pkg.mobile_access);
export const selectActivePackages = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.packages.filter(pkg => pkg.is_active);
export const selectSubscriptionPackagesLoading = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.loading;
export const selectSubscriptionPackagesError = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.error;
export const selectSubscriptionPackagesPagination = (state: { subscriptionPackages: SubscriptionPackageState }) => 
  state.subscriptionPackages.pagination;

// Export actions
export const { 
  clearSubscriptionPackageError, 
  clearSelectedPackage,
  resetSubscriptionPackageState 
} = subscriptionPackageSlice.actions;

// Export reducer
export default subscriptionPackageSlice.reducer;