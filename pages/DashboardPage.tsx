import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Wallet, ImpactMetrics, Exchange, Listing, ListingStatus } from '../types';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [recentExchanges, setRecentExchanges] = useState<Exchange[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [walletData, metricsData, exchangesData, listingsData] = await Promise.all([
            api.getWallet(),
            api.getImpactMetrics(),
            api.getMyExchanges(),
            api.getMyListings(),
          ]);
          setWallet(walletData);
          setMetrics(metricsData);
          setRecentExchanges(exchangesData.slice(0, 3));
          setMyListings(listingsData.filter(l => l.status === ListingStatus.ACTIVE).slice(0, 3));
        } catch (error) {
          console.error("Error al cargar datos del dashboard:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Spinner />;
  if (!user) return <p>Usuario no encontrado.</p>;

  return (
    <div>
      <h1 className="text-4xl font-bold text-green-dark mb-6">Hola, {user.name}</h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Saldo actual" value={`${wallet?.balance || 0} créditos`} />
        <KpiCard title="Intercambios completados" value={metrics?.reusedItems || 0} />
        <KpiCard title="CO2 evitado (kg)" value={metrics?.co2Saved.toFixed(2) || 0} />
        <KpiCard title="Horas de servicio" value={metrics?.serviceHours || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mis Publicaciones Activas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mis Publicaciones Activas</h2>
          {myListings.length > 0 ? (
            <ul className="space-y-3">
              {myListings.map(l => (
                <li key={l.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                  <Link to={`/listings/${l.id}`} className="text-green-primary hover:underline">{l.title}</Link>
                  <span className="font-semibold">{l.unitCredits} créditos</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No tienes publicaciones activas.</p>
          )}
          <Link to="/listings/new" className="mt-4 inline-block bg-green-primary hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors">
            Crear Nueva Publicación
          </Link>
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Últimos Intercambios</h2>
          {recentExchanges.length > 0 ? (
            <ul className="space-y-3">
              {recentExchanges.map(ex => (
                <li key={ex.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                  <div>
                    <p className="font-semibold">{ex.listingTitle}</p>
                    <p className="text-sm text-gray-500">
                      {ex.buyerId === user.id ? `Compraste a ${ex.sellerName}` : `Vendiste a ${ex.buyerName}`}
                    </p>
                  </div>
                  <span className={`font-bold ${ex.buyerId === user.id ? 'text-red-600' : 'text-green-600'}`}>
                    {ex.buyerId === user.id ? '-' : '+'}{ex.totalCredits} créditos
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No has realizado intercambios aún.</p>
          )}
          <Link to="/exchanges" className="mt-4 inline-block text-green-primary hover:underline">Ver todos</Link>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center">
    <h3 className="text-lg text-gray-600 mb-2">{title}</h3>
    <p className="text-4xl font-extrabold text-green-primary">{value}</p>
  </div>
);

export default DashboardPage;
