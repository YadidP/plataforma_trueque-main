import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ImpactMetrics, Exchange, Listing, ListingStatus } from '../types';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import ImpactMetricsPanel from '../components/ImpactMetricsPanel'; // Importamos el componente
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [recentExchanges, setRecentExchanges] = useState<Exchange[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Cargamos todos los datos necesarios en paralelo
        const [walletData, metricsData, exchangesData, listingsData] = await Promise.all([
          api.getWallet(),
          api.getImpactMetrics(),
          api.getMyExchanges(),
          api.getMyListings(),
        ]);

        setWallet(walletData);
        setMetrics(metricsData);
        setRecentExchanges(exchangesData.slice(0, 3)); // Solo los 3 últimos
        setMyListings(listingsData.filter(l => l.status === ListingStatus.ACTIVE).slice(0, 3));
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || loading) return <Spinner />;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Encabezado de Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Hola, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500">Bienvenido a tu panel de economía circular.</p>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <p className="text-sm text-gray-500 uppercase font-semibold">Saldo Disponible</p>
          <p className="text-4xl font-bold text-green-primary">{wallet?.balance || 0} <span className="text-lg text-gray-600">créditos</span></p>
        </div>
      </div>

      {/* 2. Panel de Impacto Ambiental (Lo nuevo) */}
      <section>
        <ImpactMetricsPanel metrics={metrics} loading={loading} />
      </section>

      {/* 3. Grid de Gestión (Publicaciones y Actividad) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Mis Publicaciones */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">📦 Mis Publicaciones</h2>
            <Link to="/listings/new" className="text-sm font-bold text-green-600 hover:underline">+ Nueva</Link>
          </div>
          {myListings.length > 0 ? (
            <ul className="space-y-3">
              {myListings.map(l => (
                <li key={l.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <Link to={`/listings/${l.id}`} className="font-medium text-gray-700 hover:text-green-700">
                    {l.title}
                  </Link>
                  <span className="text-sm font-bold text-green-600">{l.unitCredits} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-4">No tienes publicaciones activas.</p>
          )}
          <Link to="/listings" className="block mt-4 text-center text-sm text-gray-500 hover:text-gray-700">Ver todas mis publicaciones</Link>
        </div>

        {/* Última Actividad */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">🔄 Actividad Reciente</h2>
            
            {/* BOTÓN DE ACCESO DIRECTO */}
            <Link to="/exchanges" className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-bold bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors">
              Ver historial completo →
            </Link>
          </div>
          {recentExchanges.length > 0 ? (
            <ul className="space-y-3">
              {recentExchanges.map(ex => {
                const isBuyer = ex.buyerId === user.id;
                return (
                  <li key={ex.id} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{ex.listingTitle}</p>
                      <p className="text-xs text-gray-500">
                        {isBuyer ? `Compraste a ${ex.sellerName}` : `Vendiste a ${ex.buyerName}`}
                      </p>
                    </div>
                    <span className={`font-bold ${isBuyer ? 'text-red-500' : 'text-green-500'}`}>
                      {isBuyer ? '-' : '+'}{ex.totalCredits}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-4">Sin actividad reciente.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
