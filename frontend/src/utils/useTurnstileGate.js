import { useState } from 'react';
import { TURNSTILE_ENABLED } from '../config';

const TURNSTILE_REQUIRED_MESSAGE = 'Please complete the security check and try again.';

const useTurnstileGate = () => {
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);

  const resetTurnstile = () => {
    setTurnstileToken('');
    setTurnstileResetKey((currentValue) => currentValue + 1);
  };

  const validateTurnstile = (setError) => {
    if (!TURNSTILE_ENABLED) {
      return true;
    }

    if (turnstileToken) {
      return true;
    }

    setError?.(TURNSTILE_REQUIRED_MESSAGE);
    return false;
  };

  return {
    turnstileEnabled: TURNSTILE_ENABLED,
    turnstileResetKey,
    turnstileToken,
    setTurnstileToken,
    resetTurnstile,
    validateTurnstile
  };
};

export default useTurnstileGate;
