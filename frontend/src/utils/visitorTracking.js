import { API_ENDPOINTS } from '../config/api';

const SESSION_STORAGE_KEY = 'visitorSessionId';

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return 'server-render';
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextSessionId = createSessionId();
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
};

export const trackPageView = async ({ pathname, search = '', hash = '' }) => {
  if (typeof window === 'undefined') {
    return;
  }

  const path = `${pathname || '/'}${search || ''}${hash || ''}`;
  const payload = {
    path,
    sessionId: getSessionId(),
    pageTitle: document.title,
    referrer: document.referrer || ''
  };

  try {
    await fetch(API_ENDPOINTS.VISITOR_TRACK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload),
      keepalive: true
    });
  } catch (error) {
    // Tracking must never interrupt the app experience.
  }
};

export default trackPageView;
