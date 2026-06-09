'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    is_verified: boolean;
  } | null;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
  });

  const setAuth = (newAuth: AuthState) => {
    setAuthState(newAuth);
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  };
  

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}