import React, { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

const clearLegacyStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('user');
  window.localStorage.removeItem('token');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const clearAuthState = () => {
    setUser(null);
    setToken(null);
    clearLegacyStorage();
  };

  const login = (userData, csrfTokenData) => {
    clearLegacyStorage();
    setUser(userData);
    setToken(csrfTokenData || null);
    setAuthLoading(false);
  };

  const logout = async ({ notifyServer = true } = {}) => {
    const currentCsrfToken = token;

    if (notifyServer) {
      try {
        await axios.post(
          API_ENDPOINTS.LOGOUT,
          {},
          {
            withCredentials: true,
            skipAuthRedirect: true,
            headers: currentCsrfToken ? { 'X-CSRF-Token': currentCsrfToken } : {}
          }
        );
      } catch (error) {
        // Always clear local auth state even if the backend session has already expired.
      }
    }

    clearAuthState();
    setAuthLoading(false);
  };

  useEffect(() => {
    const restoreSession = async () => {
      const legacyToken = typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;

      try {
        const response = await axios.get(API_ENDPOINTS.SESSION, {
          withCredentials: true,
          skipAuthRedirect: true,
          headers: legacyToken ? { Authorization: `Bearer ${legacyToken}` } : {}
        });

        if (response.data?.user && response.data?.csrfToken) {
          setUser(response.data.user);
          setToken(response.data.csrfToken);
        } else {
          clearAuthState();
        }
      } catch (error) {
        clearAuthState();
      } finally {
        clearLegacyStorage();
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, csrfToken: token, authLoading, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
