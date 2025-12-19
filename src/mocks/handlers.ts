import { http, HttpResponse, delay } from 'msw';
import type { LoginCredentials, LoginResponse, ApiError, Verify2FACredentials, Verify2FAResponse } from '../api/types';

// Test credentials for different scenarios
const TEST_USERS = {
  valid: {
    email: 'test@example.com',
    password: 'password123',
  },
  notFound: {
    email: 'notfound@example.com',
  },
  serverError: {
    email: 'error@example.com',
  },
  slowResponse: {
    email: 'slow@example.com',
    password: 'password123',
  },
  timeout: {
    email: 'timeout@example.com',
  },
  offline: {
    email: 'offline@example.com',
  },
};

// Test 2FA codes for different scenarios
const TEST_2FA_CODES = {
  valid: '123456',
  expired: '000000',
  timeout: '999999',
};

// Store for temporary tokens (simulating server-side session)
const tempTokenStore = new Map<string, { email: string; createdAt: number }>();

export const handlers = [
  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as LoginCredentials;
    const { email, password } = body;

    // Simulate slow response (3 seconds)
    if (email === TEST_USERS.slowResponse.email) {
      await delay(3000);
      const tempToken = `temp-token-${Date.now()}`;
      tempTokenStore.set(tempToken, { email, createdAt: Date.now() });
      const response: LoginResponse = {
        token: '',
        user: {
          id: 2,
          email: email,
        },
        requires2FA: true,
        tempToken,
      };
      return HttpResponse.json(response);
    }

    // Simulate timeout (30 seconds - will trigger axios timeout)
    if (email === TEST_USERS.timeout.email) {
      await delay(30000);
      return HttpResponse.json({ message: 'This should timeout' });
    }

    // Simulate network error / offline
    if (email === TEST_USERS.offline.email) {
      return HttpResponse.error();
    }

    // Simulate server error (500)
    if (email === TEST_USERS.serverError.email) {
      await delay(500);
      const errorResponse: ApiError = {
        error: 'server_error',
        message: 'Something went wrong',
      };
      return HttpResponse.json(errorResponse, { status: 500 });
    }

    // Simulate user not found (404)
    if (email === TEST_USERS.notFound.email) {
      await delay(500);
      const errorResponse: ApiError = {
        error: 'user_not_found',
        message: 'User does not exist',
      };
      return HttpResponse.json(errorResponse, { status: 404 });
    }

    // Simulate invalid credentials (401)
    if (email === TEST_USERS.valid.email && password !== TEST_USERS.valid.password) {
      await delay(500);
      const errorResponse: ApiError = {
        error: 'invalid_credentials',
        message: 'Email or password is incorrect',
      };
      return HttpResponse.json(errorResponse, { status: 401 });
    }

    // Simulate successful login - requires 2FA
    if (email === TEST_USERS.valid.email && password === TEST_USERS.valid.password) {
      await delay(800);
      const tempToken = `temp-token-${Date.now()}`;
      tempTokenStore.set(tempToken, { email, createdAt: Date.now() });
      const response: LoginResponse = {
        token: '',
        user: {
          id: 1,
          email: email,
        },
        requires2FA: true,
        tempToken,
      };
      return HttpResponse.json(response);
    }

    // Default: user not found for any other email
    await delay(500);
    const errorResponse: ApiError = {
      error: 'user_not_found',
      message: 'User does not exist',
    };
    return HttpResponse.json(errorResponse, { status: 404 });
  }),

  // 2FA verification endpoint
  http.post('/api/auth/verify-2fa', async ({ request }) => {
    const body = await request.json() as Verify2FACredentials;
    const { tempToken, code } = body;

    // Simulate timeout for specific code
    if (code === TEST_2FA_CODES.timeout) {
      await delay(30000);
      return HttpResponse.json({ message: 'This should timeout' });
    }

    // Check if temp token exists
    const tokenData = tempTokenStore.get(tempToken);
    if (!tokenData) {
      await delay(500);
      const errorResponse: ApiError = {
        error: '2fa_expired',
        message: '2FA session has expired. Please login again.',
      };
      return HttpResponse.json(errorResponse, { status: 401 });
    }

    // Simulate expired 2FA code
    if (code === TEST_2FA_CODES.expired) {
      await delay(500);
      const errorResponse: ApiError = {
        error: '2fa_expired',
        message: '2FA code has expired. Please request a new code.',
      };
      return HttpResponse.json(errorResponse, { status: 401 });
    }

    // Simulate invalid 2FA code
    if (code !== TEST_2FA_CODES.valid) {
      await delay(500);
      const errorResponse: ApiError = {
        error: 'invalid_2fa_code',
        message: 'Invalid verification code. Please try again.',
      };
      return HttpResponse.json(errorResponse, { status: 401 });
    }

    // Simulate successful 2FA verification
    await delay(800);
    tempTokenStore.delete(tempToken);
    const response: Verify2FAResponse = {
      token: 'fake-jwt-token-after-2fa',
      user: {
        id: 1,
        email: tokenData.email,
      },
    };
    return HttpResponse.json(response);
  }),
];

// Export test credentials for documentation
export { TEST_USERS, TEST_2FA_CODES };
