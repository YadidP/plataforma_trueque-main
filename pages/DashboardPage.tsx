import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ImpactMetrics, Exchange, Listing, ListingStatus } from '../types';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import ImpactMetricsPanel from '../components/ImpactMetricsPanel';
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
        const [walletData, metricsData, exchangesData, listingsData] = await Promise.all([
          api.getWallet(),
          api.getImpactMetrics(),
          api.getMyExchanges(),
          api.getMyListings(),
        ]);

        setWallet(walletData);
        setMetrics(metricsData);
        setRecentExchanges(exchangesData.slice(0, 5));
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
    // AGREGADO: pt-10 para bajar el contenido y que no choque con el header
    <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-10 px-4">
      
      {/* 1. Encabezado de Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Hola, <span className="text-green-600">{user.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Bienvenido a tu panel de economía circular.</p>
        </div>
        <div className="text-right mt-6 md:mt-0 bg-green-50 px-6 py-4 rounded-2xl border border-green-100">
          <p className="text-xs text-green-600 uppercase font-bold tracking-widest mb-1">Saldo Disponible</p>
          <p className="text-5xl font-extrabold text-green-700">{wallet?.balance || 0} <span className="text-xl text-green-500 font-medium">créditos</span></p>
        </div>
      </div>

      {/* 2. Panel de Impacto Ambiental */}
      <section>
        <ImpactMetricsPanel metrics={metrics} loading={loading} />
      </section>

      {/* 3. Grid de Gestión */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SECCIÓN MIS PUBLICACIONES (REDISEÑADA) */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col h-full">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>📦</span> Mis Publicaciones
            </h2>
            <Link to="/listings" className="text-sm font-semibold text-green-600 hover:text-green-800 hover:underline transition">
              Ver todo
            </Link>
          </div>

          {/* Botón Grande para Crear */}
          <Link 
            to="/listings/new" 
            className="group relative w-full py-4 px-6 mb-6 rounded-2xl border-2 border-dashed border-green-300 hover:border-green-500 bg-green-50/50 hover:bg-green-50 transition-all flex items-center justify-center gap-3"
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform text-xl font-bold">
              +
            </div>
            <span className="text-lg font-bold text-green-700 group-hover:text-green-800">Crear Nueva Publicación</span>
          </Link>
          
          <div className="flex-1 space-y-3">
            {myListings.length > 0 ? (
              myListings.map(l => (
                // LINK A LA PUBLICACIÓN: Toda la fila es clicable
                <Link 
                  key={l.id} 
                  to={`/listings/${l.id}`}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-green-200 transition-all group"
                >
                  <img 
                    src={l.imageUrl || '/placeholder.jpg'} 
                    alt={l.title} 
                    className="w-16 h-16 object-cover rounded-xl bg-gray-100 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-green-700 transition-colors">
                      {l.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Activa</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-extrabold text-green-600">{l.unitCredits}</span>
                    <span className="text-xs text-gray-400 font-medium">créditos</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No tienes publicaciones activas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Última Actividad */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span>🔄</span> Actividad Reciente
            </h2>
          </div>

          {recentExchanges.length > 0 ? (
            <ul className="space-y-4">
              {recentExchanges.map(ex => {
                const isBuyer = ex.buyerId === user.id;
                return (
                  <li key={ex.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isBuyer ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isBuyer ? '🛒' : '💰'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1">{ex.listingTitle}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isBuyer ? `Vendedor: ${ex.sellerName}` : `Comprador: ${ex.buyerName}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${isBuyer ? 'text-red-500' : 'text-green-600'}`}>
                      {isBuyer ? '-' : '+'}{ex.totalCredits}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">💤</div>
              <p>Sin actividad reciente.</p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
             <Link to="/exchanges" className="inline-block px-6 py-2 rounded-full bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors">
               Ver historial completo
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;