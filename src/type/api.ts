// types/api.types.ts

import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  error?: string;
}

export type ApiError = AxiosError<ApiErrorResponse>;