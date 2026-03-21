import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import axios from 'axios';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true })));
  window.sessionStorage.clear();
  localStorage.clear();
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
    axios.get.mockResolvedValueOnce({
      data: { message: 'Email verified successfully! You can now login.' }
    });

    window.history.pushState({}, '', '/verify-email/test-token');

    render(<App />);

    expect(await screen.findByRole('heading', { name: /email verified/i })).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/auth/verify-email/test-token'));
  });
});
