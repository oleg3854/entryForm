// API Response Types
export interface User {
  id: number;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  requires2FA: boolean;
  tempToken?: string;
}

export interface Verify2FAResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Verify2FACredentials {
  tempToken: string;
  code: string;
}

// API Error Types
export interface ApiError {
  error: string;
  message: string;
}

export type ApiErrorCode = 
  | 'invalid_credentials'
  | 'user_not_found'
  | 'server_error'
  | 'network_error'
  | 'timeout_error'
  | 'invalid_2fa_code'
  | '2fa_expired';

export interface ApiErrorResponse {
  status: number;
  data: ApiError;
}
