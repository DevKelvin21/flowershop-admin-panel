import { useState, useCallback } from 'react';

/**
 * Hook for managing login/register form state
 * Separates form UI concerns from authentication logic
 */
export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const toggleRegisterMode = useCallback(() => {
    setIsRegister((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    setEmail('');
    setPassword('');
    setIsRegister(false);
  }, []);

  return {
    // State
    email,
    password,
    isRegister,

    // Setters
    setEmail,
    setPassword,
    setIsRegister,

    // Actions
    toggleRegisterMode,
    reset,
  };
}

