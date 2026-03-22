import React, { useEffect, useRef, useState } from 'react';
import { TURNSTILE_ENABLED, TURNSTILE_SITE_KEY } from '../../config';
import { loadExternalScript } from '../../utils/loadExternalScript';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

const getTurnstile = () => (
  typeof window !== 'undefined' ? window.turnstile : undefined
);

const ensureTurnstileScript = () => {
  const existingTurnstile = getTurnstile();
  if (existingTurnstile?.render) {
    return Promise.resolve(existingTurnstile);
  }

  return loadExternalScript({
    id: TURNSTILE_SCRIPT_ID,
    src: TURNSTILE_SCRIPT_SRC
  }).then(() => {
    const turnstile = getTurnstile();
    if (turnstile?.render) {
      return turnstile;
    }

    throw new Error('Turnstile failed to initialize');
  });
};

const TurnstileWidget = ({
  action,
  resetKey = 0,
  onTokenChange,
  onError
}) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const tokenChangeRef = useRef(onTokenChange);
  const errorHandlerRef = useRef(onError);
  const [widgetError, setWidgetError] = useState('');

  tokenChangeRef.current = onTokenChange;
  errorHandlerRef.current = onError;

  useEffect(() => {
    if (!TURNSTILE_ENABLED) {
      tokenChangeRef.current?.('');
      return undefined;
    }

    let cancelled = false;

    const renderTurnstile = async () => {
      try {
        const turnstile = await ensureTurnstileScript();
        if (cancelled || !containerRef.current) {
          return;
        }

        containerRef.current.textContent = '';
        setWidgetError('');
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme: 'light',
          callback: (token) => {
            tokenChangeRef.current?.(token);
          },
          'expired-callback': () => {
            tokenChangeRef.current?.('');
            if (widgetIdRef.current !== null) {
              turnstile.reset(widgetIdRef.current);
            }
          },
          'error-callback': () => {
            const nextError = 'Security check failed to load. Refresh and try again.';
            setWidgetError(nextError);
            tokenChangeRef.current?.('');
            errorHandlerRef.current?.(nextError);
          }
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        const nextError = 'Security check failed to load. Refresh and try again.';
        setWidgetError(nextError);
        tokenChangeRef.current?.('');
        errorHandlerRef.current?.(nextError);
      }
    };

    renderTurnstile();

    return () => {
      cancelled = true;
      tokenChangeRef.current?.('');
      const turnstile = getTurnstile();
      if (widgetIdRef.current !== null && turnstile?.remove) {
        turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action]);

  useEffect(() => {
    if (!TURNSTILE_ENABLED) {
      return;
    }

    const turnstile = getTurnstile();
    if (widgetIdRef.current !== null && turnstile?.reset) {
      tokenChangeRef.current?.('');
      turnstile.reset(widgetIdRef.current);
    }
  }, [resetKey]);

  if (!TURNSTILE_ENABLED) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="flex justify-center" />
      {widgetError && (
        <p className="text-sm text-red-600 text-center">{widgetError}</p>
      )}
    </div>
  );
};

export default TurnstileWidget;
