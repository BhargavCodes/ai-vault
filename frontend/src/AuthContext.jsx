// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useState, useEffect, useContext } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // Helper to refresh user data without reloading page
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const meRes = await api.get('/auth/me');
        setUser(meRes.data.user);
      }
    } catch (error) {
      console.error("Failed to refresh user profile", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } 
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    const meRes = await api.get('/auth/me');
    setUser(meRes.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};