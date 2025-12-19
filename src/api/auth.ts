import axios, { AxiosError } from 'axios';
import type { LoginCredentials, LoginResponse, ApiError, Verify2FACredentials, Verify2FAResponse } from './types';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login API function
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Network error (no response)
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
          throw {
            status: 0,
            data: {
              error: 'timeout_error',
              message: 'Request timed out',
            },
          };
        }
        throw {
          status: 0,
          data: {
            error: 'network_error',
            message: 'Network error occurred',
          },
        };
      }
      
      // Server responded with error
      throw {
        status: axiosError.response.status,
        data: axiosError.response.data,
      };
    }
    
    // Unknown error
    throw {
      status: 0,
      data: {
        error: 'unknown_error',
        message: 'An unexpected error occurred',
      },
    };
  }
};

// Verify 2FA code API function
export const verify2FA = async (credentials: Verify2FACredentials): Promise<Verify2FAResponse> => {
  try {
    const response = await apiClient.post<Verify2FAResponse>('/auth/verify-2fa', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      
      // Network error (no response)
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
          throw {
            status: 0,
            data: {
              error: 'timeout_error',
              message: 'Request timed out',
            },
          };
        }
        throw {
          status: 0,
          data: {
            error: 'network_error',
            message: 'Network error occurred',
          },
        };
      }
      
      // Server responded with error
      throw {
        status: axiosError.response.status,
        data: axiosError.response.data,
      };
    }
    
    // Unknown error
    throw {
      status: 0,
      data: {
        error: 'unknown_error',
        message: 'An unexpected error occurred',
      },
    };
  }
};

// Save token to localStorage
export const saveToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
