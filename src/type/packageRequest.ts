// type/packageRequest.ts

export interface PackageRequestData {
  full_name: string;
  email: string;
  phone_number: string;
  address?: string;
  date_of_birth?: string;
  package_id: number;
}

export interface PackageRequestResponse {
  status: boolean;
  message: string;
  request: {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    status: string;
    requested_at: string;
  };
}

export interface PackageRequestError {
  status: boolean;
  message: string;
  request: null;
}

export type PackageRequestErrorType = 
  | 'PACKAGE_NOT_FOUND'
  | 'PENDING_REQUEST_PHONE'
  | 'PENDING_REQUEST_EMAIL'
  | 'PHONE_ALREADY_REGISTERED'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_ENTRY'
  | 'INVALID_PACKAGE'
  | 'DATABASE_ERROR'
  | 'SERVER_ERROR';