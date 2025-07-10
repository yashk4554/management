
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('adminToken') ? 'admin' : 'user');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-logout on token expiry (simple check, should be improved with JWT decode)
    if (token) {
      // Optionally, decode token and check expiry
      // If expired, logout
    }
  }, [token]);

  const login = (token, isAdmin = false) => {
    if (isAdmin) {
      localStorage.setItem('adminToken', token);
      setRole('admin');
    } else {
      localStorage.setItem('token', token);
      setRole('user');
    }
    setToken(token);
    setUser({ token, role: isAdmin ? 'admin' : 'user' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    setToken(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, role, setRole, login, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
