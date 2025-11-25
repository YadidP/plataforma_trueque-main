import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = user !== null;
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        // Verificar si hay una sesión activa al cargar
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.getCurrentUser();
            if (response.user) {
                setUser(response.user);
            }
        } catch (error) {
            console.log('No active session');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        console.log('Login response user:', response.user);
        setUser(response.user);
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await api.register(name, email, password);
        setUser(response.user);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
