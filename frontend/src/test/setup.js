import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.history.pushState({}, '', '/');
  vi.clearAllMocks();
});
