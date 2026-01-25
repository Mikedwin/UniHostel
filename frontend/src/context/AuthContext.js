import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [csrfToken, setCsrfToken] = useState(localStorage.getItem('csrfToken'));

  const login = (userData, tokenData, csrfTokenData) => {
    setUser(userData);
    setToken(tokenData);
    setCsrfToken(csrfTokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    if (csrfTokenData) {
      localStorage.setItem('csrfToken', csrfTokenData);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCsrfToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('csrfToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, csrfToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
