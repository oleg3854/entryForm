import { useState, useCallback } from 'react';
import { AuthForm } from '../components/AuthForm';
import { TwoFactorForm } from '../components/TwoFactorForm';
import type { LoginResponse, Verify2FAResponse } from '../api/types';

interface TwoFactorState {
  tempToken: string;
  userEmail: string;
}

export const LoginPage = () => {
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState | null>(null);
  const [isFullyAuthenticated, setIsFullyAuthenticated] = useState(false);

  const handleLoginSuccess = useCallback((response: LoginResponse) => {
    console.log('Login successful:', response);
    
    if (response.requires2FA && response.tempToken) {
      // Show 2FA form
      setTwoFactorState({
        tempToken: response.tempToken,
        userEmail: response.user.email,
      });
    } else {
      // Direct login without 2FA (if ever needed)
      setIsFullyAuthenticated(true);
    }
  }, []);

  const handle2FASuccess = useCallback((response: Verify2FAResponse) => {
    console.log('2FA verification successful:', response);
    setIsFullyAuthenticated(true);
  }, []);

  const handleBackToLogin = useCallback(() => {
    setTwoFactorState(null);
  }, []);

  // Show success screen after full authentication
  if (isFullyAuthenticated) {
    return (
      <div className="auth-form-container">
        <div className="auth-form-card" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="32" fill="#10B981" />
              <path
                d="M20 32L28 40L44 24"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
            Welcome!
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            You have successfully signed in.
          </p>
          <button
            onClick={() => {
              setIsFullyAuthenticated(false);
              setTwoFactorState(null);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4f46e5',
              backgroundColor: '#eef2ff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Sign out (demo)
          </button>
        </div>
      </div>
    );
  }

  // Show 2FA form if login was successful and requires 2FA
  if (twoFactorState) {
    return (
      <TwoFactorForm
        tempToken={twoFactorState.tempToken}
        userEmail={twoFactorState.userEmail}
        onSuccess={handle2FASuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  // Show login form
  return <AuthForm onSuccess={handleLoginSuccess} />;
};

export default LoginPage;
