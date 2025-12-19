import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { verify2FA, saveToken } from '../../api/auth';
import type { Verify2FACredentials, Verify2FAResponse, ApiErrorResponse, User } from '../../api/types';
import './TwoFactorForm.css';

// Error message mapping for 2FA
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
  switch (data.error) {
    case 'invalid_2fa_code':
      return 'Invalid verification code. Please try again.';
    case '2fa_expired':
      return 'Verification session expired. Please login again.';
    default:
      return data.message || 'An unexpected error occurred.';
  }
};

interface TwoFactorFormProps {
  tempToken: string;
  userEmail: string;
  onSuccess?: (response: Verify2FAResponse) => void;
  onBack?: () => void;
}

export const TwoFactorForm = ({ tempToken, userEmail, onSuccess, onBack }: TwoFactorFormProps) => {
  // Form state - 6 digit code
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Get full code string
  const fullCode = useMemo(() => code.join(''), [code]);

  // Check if code is complete
  const isCodeComplete = useMemo(() => fullCode.length === 6, [fullCode]);

  // 2FA verification mutation
  const verify2FAMutation = useMutation<Verify2FAResponse, ApiErrorResponse, Verify2FACredentials>({
    mutationFn: verify2FA,
    onSuccess: (data) => {
      // Save token to localStorage
      saveToken(data.token);
      // Call success callback if provided
      onSuccess?.(data);
    },
  });

  // Handle individual digit input
  const handleDigitChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    setCode((prev) => {
      const newCode = [...prev];
      newCode[index] = value;
      return newCode;
    });

    // Move to next input if value entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newCode.findIndex((digit) => !digit);
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  }, [code]);

  // Handle backspace
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!isCodeComplete) return;
      
      verify2FAMutation.mutate({ tempToken, code: fullCode });
    },
    [tempToken, fullCode, isCodeComplete, verify2FAMutation]
  );

  const apiError = verify2FAMutation.error ? getErrorMessage(verify2FAMutation.error) : '';

  return (
    <div className="two-factor-form-container">
      <div className="two-factor-form-card">
        {/* Google Authenticator Icon */}
        <div className="two-factor-form-logo">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="56" height="56" rx="14" fill="#4285F4" />
            <path
              d="M28 16C21.373 16 16 21.373 16 28C16 34.627 21.373 40 28 40C34.627 40 40 34.627 40 28C40 21.373 34.627 16 28 16ZM28 18C33.523 18 38 22.477 38 28C38 33.523 33.523 38 28 38C22.477 38 18 33.523 18 28C18 22.477 22.477 18 28 18Z"
              fill="white"
            />
            <path
              d="M28 20V28L33 33"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="two-factor-form-title">Two-Factor Authentication</h1>
        
        {/* Description */}
        <p className="two-factor-form-description">
          Enter the 6-digit code from your Google Authenticator app for <strong>{userEmail}</strong>
        </p>

        {/* Form */}
        <form className="two-factor-form" onSubmit={handleSubmit}>
          {/* Code input */}
          <div className="code-input-container">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`code-input ${apiError ? 'code-input-error' : ''}`}
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={verify2FAMutation.isPending}
                autoComplete="one-time-code"
              />
            ))}
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
            disabled={!isCodeComplete || verify2FAMutation.isPending}
          >
            {verify2FAMutation.isPending ? (
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
                <span>Verifying...</span>
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Back button */}
          {onBack && (
            <button
              type="button"
              className="back-button"
              onClick={onBack}
              disabled={verify2FAMutation.isPending}
            >
              ← Back to login
            </button>
          )}
        </form>

        {/* Success message */}
        {verify2FAMutation.isSuccess && (
          <div className="success-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Successfully verified!</span>
          </div>
        )}

        {/* Test codes hint */}
        <div className="test-codes-hint">
          <p><strong>Test codes:</strong></p>
          <ul>
            <li><code>123456</code> - Success</li>
            <li><code>000000</code> - Expired code</li>
            <li><code>999999</code> - Timeout</li>
            <li>Any other - Invalid code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorForm;
