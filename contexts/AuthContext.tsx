import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      try {
        const currentUser = await api.getMe();
        setUser(currentUser);
      } catch (error) {
        console.error("Fallo al obtener el perfil de usuario:", error);
        localStorage.removeItem('jwt'); // Token inválido o expirado
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const { accessToken } = await api.login(email, password);
    localStorage.setItem('jwt', accessToken);
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const { accessToken } = await api.register(name, email, password);
    localStorage.setItem('jwt', accessToken);
    await fetchUser();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt');
  };
  
  const isAdmin = () => {
    return user?.role === UserRole.ADMIN;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
