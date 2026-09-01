import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types/auth';
import { api, setToken } from '../api';

const TOKEN_KEY = 'agriconnect_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // true until we check localStorage

  // On mount, restore token from localStorage and re-fetch profile
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setTokenState(stored);
      api.getProfile()
        .then((profile) => setUser(profile))
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setTokenState(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistToken = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setTokenState(t);
  };

  const fetchProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      logout();
    }
  };

  const handleLogin = async (payload: LoginPayload) => {
    const res = await api.login(payload);
    persistToken(res.token);
    setUser(res.user);
  };

  const handleRegister = async (payload: RegisterPayload) => {
    const res = await api.register(payload);
    persistToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
