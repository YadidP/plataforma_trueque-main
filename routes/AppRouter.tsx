
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ListingsPage from '../pages/ListingsPage';
import ListingDetailPage from '../pages/ListingDetailPage';
import CreateListingPage from '../pages/CreateListingPage';
import WalletPage from '../pages/WalletPage';
import ExchangesPage from '../pages/ExchangesPage';
import AdminPage from '../pages/AdminPage';
import NotFoundPage from '../pages/NotFoundPage';
import { UserRole } from '../types';

const AppRouter = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-2xl text-green-primary">Cargando...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Rutas Protegidas para Usuarios Autenticados - DEBEN VENIR PRIMERO */}
        <Route element={<ProtectedRoute />}>
          <Route path="listings/new" element={<CreateListingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="exchanges" element={<ExchangesPage />} />
        </Route>

        {/* Rutas Públicas - DESPUÉS DE LAS DINÁMICAS PROTEGIDAS */}
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        
        {/* Rutas Protegidas para Administradores */}
        <Route element={<ProtectedRoute roles={[UserRole.ADMIN]} />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>

        {/* 404 - Debe ser última */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
