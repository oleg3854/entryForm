import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { login, saveToken } from '../../api/auth';
import type { LoginCredentials, LoginResponse, ApiErrorResponse } from '../../api/types';
import './AuthForm.css';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Error message mapping
const getErrorMessage = (error: ApiErrorResponse): string => {
  const { status, data } = error;
  
  // Network/timeout errors (status 0)
  if (status === 0) {
    if (data.error === 'timeout_error') {
      return 'Request timed out. Please try again.';
    }
    if (data.error === 'network_error') {
      return 'Connection problem. Please check your network.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
  
  // HTTP errors
  switch (status) {
    case 401:
      return 'Incorrect email or password.';
    case 404:
      return 'User not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return data.message || 'An unexpected error occurred.';
  }
};

interface AuthFormProps {
  onSuccess?: (response: LoginResponse) => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Validation
  const emailError = useMemo(() => {
    if (!touched.email) return '';
    if (!email) return 'Email is required';
    if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email';
    return '';
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return '';
    if (!password) return 'Password is required';
    return '';
  }, [password, touched.password]);

  const isFormValid = useMemo(() => {
    return email && EMAIL_REGEX.test(email) && password;
  }, [email, password]);

  // Login mutation
  const loginMutation = useMutation<LoginResponse, ApiErrorResponse, LoginCredentials>({
    mutationFn: login,
    onSuccess: (data) => {
      // Save token to localStorage
      saveToken(data.token);
      // Call success callback if provided
      onSuccess?.(data);
    },
  });

  // Handlers
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleEmailBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, email: true }));
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setTouched((prev) => ({ ...prev, password: true }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      
      // Mark all fields as touched
      setTouched({ email: true, password: true });
      
      if (!isFormValid) return;
      
      loginMutation.mutate({ email, password });
    },
    [email, password, isFormValid, loginMutation]
  );

  const apiError = loginMutation.error ? getErrorMessage(loginMutation.error) : '';

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        {/* Logo */}
        <div className="auth-form-logo">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="12" fill="#4F46E5" />
            <path
              d="M24 14L32 20V28L24 34L16 28V20L24 14Z"
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="24" cy="24" r="4" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="auth-form-title">Sign in to your account to continue</h1>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`form-input ${emailError ? 'form-input-error' : ''}`}
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              disabled={loginMutation.isPending}
              autoComplete="email"
            />
            {emailError && <span className="form-error">{emailError}</span>}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`form-input ${passwordError ? 'form-input-error' : ''}`}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              placeholder="Enter your password"
              disabled={loginMutation.isPending}
              autoComplete="current-password"
            />
            {passwordError && <span className="form-error">{passwordError}</span>}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="api-error">
              <svg
                className="api-error-icon"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="submit-button"
            disabled={!isFormValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <svg
                  className="spinner"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="spinner-track"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="spinner-head"
                    d="M12 2a10 10 0 019.95 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthForm;
