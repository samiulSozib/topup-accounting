// types/businessOwner.types.ts
export interface IBusinessOwner {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  thumbnail_image: string | null;
  currency: string | null;
  total_sales_amount: number;
  total_unpaid_amount: number;
  password?: string; // Optional as we might not want to expose this
  date_of_birth: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  status: boolean;
  message: string;
  token: string;
  business_owner: IBusinessOwner;
}

export interface ILoginCredentials {
  phone_number: string;
  password: string;
}

export interface IAuthState {
  businessOwner: IBusinessOwner | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}