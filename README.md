# Sign-in Form Test

A React sign-in form application with TypeScript, React Query, MSW (Mock Service Worker) for API mocking, and Google Authenticator-style 2FA.

## Features

- ✅ React with TypeScript
- ✅ React Query for API state management
- ✅ MSW for API mocking
- ✅ Form validation (email format, required fields)
- ✅ Responsive design (desktop + mobile)
- ✅ Comprehensive error handling
- ✅ Loading states with spinner
- ✅ Two-Factor Authentication (2FA) with Google Authenticator style
- ✅ Success feedback

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── api/
│   ├── auth.ts          # API functions for authentication
│   └── types.ts         # TypeScript types for API
├── app/
│   └── queryClient.ts   # React Query client configuration
├── components/
│   ├── AuthForm/
│   │   ├── AuthForm.tsx # Login form component
│   │   ├── AuthForm.css # Login form styles
│   │   └── index.ts     # Component exports
│   └── TwoFactorForm/
│       ├── TwoFactorForm.tsx # 2FA form component
│       ├── TwoFactorForm.css # 2FA form styles
│       └── index.ts     # Component exports
├── mocks/
│   ├── browser.ts       # MSW browser setup
│   └── handlers.ts      # MSW request handlers
├── pages/
│   └── LoginPage.tsx    # Login page with 2FA flow
├── App.tsx              # Main app component
├── main.tsx             # App entry point with MSW init
└── index.css            # Global styles
```

## Authentication Flow

1. **Login Form** - User enters email and password
2. **2FA Verification** - After successful login, user enters 6-digit code from Google Authenticator
3. **Success** - User is fully authenticated

## Testing Different Scenarios

### Login Scenarios

The mock API supports various test scenarios based on the email used:

| Email | Password | Result |
|-------|----------|--------|
| `test@example.com` | `password123` | Success → 2FA required |
| `test@example.com` | `wrongpassword` | "Incorrect email or password." |
| `notfound@example.com` | any | "User not found." |
| `error@example.com` | any | "Server error. Please try again later." |
| `slow@example.com` | `password123` | Success after 3s delay → 2FA required |
| `timeout@example.com` | any | "Request timed out. Please try again." |
| `offline@example.com` | any | "Connection problem. Please check your network." |
| Any other email | any | "User not found." |

### 2FA Verification Scenarios

After successful login, use these codes to test different 2FA scenarios:

| Code | Result |
|------|--------|
| `123456` | Success - Full authentication |
| `000000` | "Verification session expired. Please login again." |
| `999999` | Timeout - Request times out |
| Any other | "Invalid verification code. Please try again." |

## API Endpoints

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Success Response (200) - Requires 2FA:**
```json
{
  "token": "",
  "user": {
    "id": 1,
    "email": "test@example.com"
  },
  "requires2FA": true,
  "tempToken": "temp-token-123456789"
}
```

**Error Responses:**

401 - Invalid Credentials:
```json
{
  "error": "invalid_credentials",
  "message": "Email or password is incorrect"
}
```

404 - User Not Found:
```json
{
  "error": "user_not_found",
  "message": "User does not exist"
}
```

500 - Server Error:
```json
{
  "error": "server_error",
  "message": "Something went wrong"
}
```

### POST /api/auth/verify-2fa

**Request Body:**
```json
{
  "tempToken": "temp-token-123456789",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "token": "fake-jwt-token-after-2fa",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

**Error Responses:**

401 - Invalid 2FA Code:
```json
{
  "error": "invalid_2fa_code",
  "message": "Invalid verification code. Please try again."
}
```

401 - 2FA Expired:
```json
{
  "error": "2fa_expired",
  "message": "2FA session has expired. Please login again."
}
```

## Form Validation

### Login Form
- **Email:** Required, must be valid email format
- **Password:** Required
- **Submit Button:** Disabled until form is valid

### 2FA Form
- **Code:** 6 digits required
- **Submit Button:** Disabled until all 6 digits entered
- Supports paste functionality
- Auto-focuses next input on digit entry

## Error Messages Mapping

### Login Errors
| API Error | UI Message |
|-----------|------------|
| 401 (invalid_credentials) | "Incorrect email or password." |
| 404 (user_not_found) | "User not found." |
| 500 (server_error) | "Server error. Please try again later." |
| Network error | "Connection problem. Please check your network." |
| Timeout | "Request timed out. Please try again." |

### 2FA Errors
| API Error | UI Message |
|-----------|------------|
| invalid_2fa_code | "Invalid verification code. Please try again." |
| 2fa_expired | "Verification session expired. Please login again." |
| Network error | "Connection problem. Please check your network." |
| Timeout | "Request timed out. Please try again." |

## Technologies Used

- [React](https://react.dev/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [React Query](https://tanstack.com/query) - Server state management
- [Axios](https://axios-http.com/) - HTTP client
- [MSW](https://mswjs.io/) - API mocking

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
