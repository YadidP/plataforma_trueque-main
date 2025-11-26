import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';

// Importaciones de páginas
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ListingsPage from '../pages/ListingsPage';
import ListingDetailPage from '../pages/ListingDetailPage';
import CreateListingPage from '../pages/CreateListingPage';
import EditListingPage from '../pages/EditListingPage';
import WalletPage from '../pages/WalletPage';
import ExchangesPage from '../pages/ExchangesPage';
import AdminPage from '../pages/AdminPage';
import ProfilePage from '../pages/ProfilePage'; // <--- ASEGÚRATE DE TENER ESTE ARCHIVO CREADO (Del paso anterior)
import CampaignsPage from '../pages/CampaignsPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Rutas Protegidas */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="exchanges" element={<ExchangesPage />} />

        {/* Rutas Públicas/Mixtas */}
        <Route path="listings" element={<ListingsPage />} />
        <Route path="listings/:id" element={<ListingDetailPage />} />
        <Route path="listings/new" element={<CreateListingPage />} />
        <Route path="listings/edit/:id" element={<EditListingPage />} />

        {/* RUTA FALTANTE QUE CAUSABA EL 404 */}
        <Route path="profile/:id" element={<ProfilePage />} />

        <Route path="admin" element={<AdminPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;