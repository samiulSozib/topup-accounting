// store/slices/packageRequestSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { 
  PackageRequestData, 
  PackageRequestResponse,
  PackageRequestError
} from '../../type/packageRequest';
import { ApiError } from '../../type/api';

const API_URL = import.meta.env.VITE_BASE_URL || '';

interface PackageRequestState {
  currentRequest: PackageRequestResponse['request'] | null;
  submitting: boolean;
  error: string | null;
  success: boolean;
  statusCode: number | null;
}

const initialState: PackageRequestState = {
  currentRequest: null,
  submitting: false,
  error: null,
  success: false,
  statusCode: null
};

// Helper function to handle API errors with proper status codes
const handleApiError = (error: unknown): { message: string; statusCode: number } => {
  const apiError = error as ApiError;
  
  // Default error
  let message = 'An unexpected error occurred. Please try again later.';
  let statusCode = 500;

  if (apiError.response) {
    statusCode = apiError.response.status;
    
    // Get message from response data
    if (apiError.response.data?.message) {
      message = apiError.response.data.message;
    }
    
    // Handle specific status codes
    switch (statusCode) {
      case 400:
        message = message || 'Invalid request. Please check your input.';
        break;
      case 404:
        message = message || 'Package not found or not available.';
        break;
      case 409:
        message = message || 'Conflict with existing data.';
        break;
      case 503:
        message = message || 'Service unavailable. Please try again later.';
        break;
    }
  } else if (apiError.request) {
    message = 'No response from server. Please check your connection.';
    statusCode = 0;
  } else {
    message = apiError.message || message;
  }

  return { message, statusCode };
};

// Async Thunk - Submit Package Request (Public - No Auth Required)
export const submitPackageRequest = createAsyncThunk<
  PackageRequestResponse,
  PackageRequestData,
  { rejectValue: { message: string; statusCode: number } }
>(
  'packageRequest/submit',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await axios.post<PackageRequestResponse>(
        `${API_URL}/package-requests/submit`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      const handledError = handleApiError(error);
      return rejectWithValue(handledError);
    }
  }
);

// Slice
const packageRequestSlice = createSlice({
  name: 'packageRequest',
  initialState,
  reducers: {
    clearPackageRequestError: (state) => {
      state.error = null;
      state.statusCode = null;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    resetPackageRequestState: () => initialState,
    resetSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit Package Request
      .addCase(submitPackageRequest.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.statusCode = null;
        state.success = false;
      })
      .addCase(submitPackageRequest.fulfilled, (state, action: PayloadAction<PackageRequestResponse>) => {
        state.submitting = false;
        state.success = true;
        state.currentRequest = action.payload.request;
        state.error = null;
        state.statusCode = 201;
      })
      .addCase(submitPackageRequest.rejected, (state, action) => {
        state.submitting = false;
        state.success = false;
        state.error = action.payload?.message || 'Failed to submit package request';
        state.statusCode = action.payload?.statusCode || 500;
      });
  }
});

// Selectors
export const selectCurrentRequest = (state: { packageRequest: PackageRequestState }) => 
  state.packageRequest.currentRequest;
export const selectPackageRequestSubmitting = (state: { packageRequest: PackageRequestState }) => 
  state.packageRequest.submitting;
export const selectPackageRequestError = (state: { packageRequest: PackageRequestState }) => 
  state.packageRequest.error;
export const selectPackageRequestStatusCode = (state: { packageRequest: PackageRequestState }) => 
  state.packageRequest.statusCode;
export const selectPackageRequestSuccess = (state: { packageRequest: PackageRequestState }) => 
  state.packageRequest.success;

// Export actions
export const { 
  clearPackageRequestError, 
  clearCurrentRequest,
  resetPackageRequestState,
  resetSuccess
} = packageRequestSlice.actions;

// Export reducer
export default packageRequestSlice.reducer;