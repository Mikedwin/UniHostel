import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    defaults: {},
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(() => 1), eject: vi.fn() },
      response: { use: vi.fn(() => 1), eject: vi.fn() }
    }
  }
}));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
  window.sessionStorage.clear();
  localStorage.clear();
  axios.get.mockImplementation((url) => {
    if (url.includes('/auth/session')) {
      return Promise.resolve({ data: {} });
    }

    if (url.includes('/auth/verify-email/test-token')) {
      return Promise.resolve({
        data: { message: 'Email verified successfully! You can now login.' }
      });
    }

    return Promise.resolve({ data: {} });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App smoke tests', () => {
  it('redirects /manager-register to the contact page', async () => {
    window.history.pushState({}, '', '/manager-register');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /contact us/i })).toBeInTheDocument();
  });

  it('redirects protected routes to login when the user is not authenticated', async () => {
    window.history.pushState({}, '', '/student-dashboard');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /welcome back!/i })).toBeInTheDocument();
  });

  it('renders the verify email route and calls the verification endpoint', async () => {
    window.history.pushState({}, '', '/verify-email/test-token');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /email verified/i })).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/auth/verify-email/test-token'));
  });

  it('redirects the legacy in-app reset route to forgot password', async () => {
    window.history.pushState({}, '', '/reset-password-inapp');

    render(<App />);

    expect(await screen.findByLabelText(/current password/i)).toBeInTheDocument();
  });
});
