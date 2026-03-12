// store/slices/businessOwnerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { IBusinessOwner, ILoginCredentials, IAuthState, IAuthResponse } from '../../type/businessOwner';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

// Helper function to get initial auth state from localStorage
const getInitialAuthState = (): IAuthState => {
  const token = localStorage.getItem('token');
  const businessOwnerData = localStorage.getItem('businessOwner');
  
  if (token && businessOwnerData) {
    try {
      const businessOwner = JSON.parse(businessOwnerData) as IBusinessOwner;
      return {
        businessOwner,
        token,
        isAuthenticated: true, // User is authenticated if token exists
        isLoading: false,
        error: null,
      };
    } catch (error) {
      // Invalid data in localStorage - clear it
      localStorage.removeItem('token');
      localStorage.removeItem('businessOwner');
    }
  }
  
  return {
    businessOwner: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

// Initial state with localStorage check
const initialState: IAuthState = getInitialAuthState();

// Define error response type
interface ErrorResponse {
  message?: string;
}

// Async thunk for login
export const loginBusinessOwner = createAsyncThunk<
  IAuthResponse,
  ILoginCredentials,
  { rejectValue: string }
>(
  'businessOwner/login',
  async (credentials: ILoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axios.post<IAuthResponse>(
        `${BASE_URL}/auth/sign-in`,
        credentials
      );
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('businessOwner', JSON.stringify(response.data.business_owner));
      }
      
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data?.message || 'Login failed');
    }
  }
);

// Async thunk for logout
export const logoutBusinessOwner = createAsyncThunk<null, void>(
  'businessOwner/logout',
  async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('businessOwner');
    return null;
  }
);

// Slice
const businessOwnerSlice = createSlice({
  name: 'businessOwner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateBusinessOwner: (state, action: PayloadAction<Partial<IBusinessOwner>>) => {
      if (state.businessOwner) {
        state.businessOwner = { ...state.businessOwner, ...action.payload };
        // Update localStorage
        localStorage.setItem('businessOwner', JSON.stringify(state.businessOwner));
      }
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginBusinessOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginBusinessOwner.fulfilled, (state, action: PayloadAction<IAuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.businessOwner = action.payload.business_owner;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginBusinessOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
      })
      
    // Logout cases
    builder
      .addCase(logoutBusinessOwner.fulfilled, (state) => {
        state.businessOwner = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

// Export actions
export const { clearError, updateBusinessOwner } = businessOwnerSlice.actions;

// Selectors
export const selectBusinessOwner = (state: { businessOwner: IAuthState }) => state.businessOwner.businessOwner;
export const selectIsAuthenticated = (state: { businessOwner: IAuthState }) => state.businessOwner.isAuthenticated;
export const selectAuthLoading = (state: { businessOwner: IAuthState }) => state.businessOwner.isLoading;
export const selectAuthError = (state: { businessOwner: IAuthState }) => state.businessOwner.error;
export const selectToken = (state: { businessOwner: IAuthState }) => state.businessOwner.token;

// Export reducer
export default businessOwnerSlice.reducer;