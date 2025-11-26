import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';
import BannedPage from '../pages/BannedPage'; // Importar

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface BanInfo {
    reason: string;
    expires: string;
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
    const [banInfo, setBanInfo] = useState<BanInfo | null>(null); // Estado para ban

    const isAuthenticated = user !== null;
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await api.getCurrentUser();
            if (response.user) {
                setUser(response.user);
            }
        } catch (error: any) {
            // Capturar error de baneo en sesión activa
            if (error.response?.data?.message === 'ACCOUNT_BANNED') {
                setBanInfo({
                    reason: error.response.data.reason,
                    expires: error.response.data.expires
                });
            }
            console.log('No active session or banned');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.login(email, password);
            setUser(response.user);
            setBanInfo(null); // Limpiar ban si loguea exitosamente
        } catch (error: any) {
            // Capturar error de baneo en login
            if (error.response?.data?.message === 'ACCOUNT_BANNED') {
                setBanInfo({
                    reason: error.response.data.reason,
                    expires: error.response.data.expires
                });
                // Re-lanzamos el error para que el LoginPage detenga el loading, 
                // pero el renderizado cambiará a BannedPage
                throw error; 
            }
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        const response = await api.register(name, email, password);
        setUser(response.user);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        setBanInfo(null); // Limpiar estado de ban al salir
    };

    // INTERCEPTOR DE RENDERIZADO: Si está baneado, muestra SOLO la pantalla de ban
    if (banInfo) {
        return <BannedPage reason={banInfo.reason} expires={banInfo.expires} />;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};