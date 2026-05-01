// types/businessOwner.types.ts
export interface Currency{
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBusinessOwner {
  id: number;
  name: string;
  address: string;
  phone_number: string;
  thumbnail_image: string | null;
  currency_id: number ;
  total_sales_amount: number;
  total_unpaid_amount: number;
  password?: string; // Optional as we might not want to expose this
  date_of_birth: string;
  createdAt: string;
  updatedAt: string;
  currency: Currency; // Assuming this is a relation to a Currency type
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
