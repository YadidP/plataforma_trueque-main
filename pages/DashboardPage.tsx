import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ImpactMetrics, Exchange, Listing, ListingStatus } from '../types';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import ImpactMetricsPanel from '../components/ImpactMetricsPanel';
import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [recentExchanges, setRecentExchanges] = useState<Exchange[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        // Realizar todas las peticiones en paralelo con mejor manejo de errores
        const results = await Promise.allSettled([
          api.getWallet(),
          api.getImpactMetrics(),
          api.getMyExchanges(),
          api.getMyListings(),
        ]);

        // Procesar resultados individualmente
        if (results[0].status === 'fulfilled') {
          setWallet(results[0].value);
        } else {
          console.warn('Error al cargar wallet:', results[0].reason);
          setWallet({ balance: 0 } as Wallet);
        }

        if (results[1].status === 'fulfilled') {
          setMetrics(results[1].value);
        } else {
          console.warn('Error al cargar métricas:', results[1].reason);
          setMetrics(null);
        }

        if (results[2].status === 'fulfilled') {
          setRecentExchanges(results[2].value.slice(0, 3));
        } else {
          console.warn('Error al cargar intercambios:', results[2].reason);
          setRecentExchanges([]);
        }

        if (results[3].status === 'fulfilled') {
          const activeListings = results[3].value
            .filter(l => l.status === ListingStatus.ACTIVE)
            .slice(0, 3);
          setMyListings(activeListings);
        } else {
          console.warn('Error al cargar publicaciones:', results[3].reason);
          setMyListings([]);
        }
      } catch (err) {
        console.error("Error general al cargar datos del dashboard:", err);
        setError('Hubo un error al cargar los datos del dashboard. Por favor, intenta recargar la página.');
      } finally {
        setLoading(false);
      }
    };

    // Pequeño delay para evitar race conditions
    const timer = setTimeout(fetchData, 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Spinner />;
  if (!user) return <p className="text-center text-gray-500 py-8">Usuario no encontrado. Por favor inicia sesión.</p>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-green-dark mb-2">Hola, {user.name}</h1>
        <p className="text-gray-600">Bienvenido a tu panel de control de EcoTrade</p>
      </div>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Saldo actual" value={`${wallet?.balance || 0} créditos`} icon="💰" />
        <KpiCard title="Intercambios" value={metrics?.reusedItems || 0} icon="🔄" />
        <KpiCard title="CO2 evitado" value={`${metrics?.co2Saved?.toFixed(1) || 0} kg`} icon="🌍" />
        <KpiCard title="Horas de servicio" value={metrics?.serviceHours || 0} icon="⏱️" />
      </div>

      {/* Panel de Impacto Completo */}
      {metrics && <ImpactMetricsPanel metrics={metrics} loading={false} />}

      {/* Sección de Publicaciones e Intercambios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mis Publicaciones Activas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Mis Publicaciones Activas</h2>
          {myListings && myListings.length > 0 ? (
            <ul className="space-y-3">
              {myListings.map(l => (
                <li key={l.id} className="flex justify-between items-center p-3 rounded hover:bg-gray-50 border-l-4 border-green-primary">
                  <Link to={`/listings/${l.id}`} className="text-green-primary hover:underline font-semibold flex-1">
                    {l.title}
                  </Link>
                  <span className="font-bold text-green-primary ml-4">{l.unitCredits} ✦</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">No tienes publicaciones activas.</p>
          )}
          <Link to="/listings/new" className="mt-4 inline-block bg-green-primary hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors">
            + Crear Nueva Publicación
          </Link>
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Últimos Intercambios</h2>
          {recentExchanges && recentExchanges.length > 0 ? (
            <ul className="space-y-3">
              {recentExchanges.map(ex => (
                <li key={ex.id} className="flex justify-between items-center p-3 rounded hover:bg-gray-50 border-l-4 border-blue-primary">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{ex.listingTitle}</p>
                    <p className="text-sm text-gray-500">
                      {ex.buyerId === user.id
                        ? `🛒 Compraste a ${ex.sellerName}`
                        : `🎁 Vendiste a ${ex.buyerName}`}
                    </p>
                  </div>
                  <span className={`font-bold ml-4 ${ex.buyerId === user.id ? 'text-red-600' : 'text-green-600'}`}>
                    {ex.buyerId === user.id ? '-' : '+'}{ex.totalCredits} ✦
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 py-4">No has realizado intercambios aún.</p>
          )}
          <Link to="/exchanges" className="mt-4 inline-block text-green-primary hover:underline font-semibold">
            Ver todos los intercambios →
          </Link>
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string | number; icon?: string }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600 font-semibold mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-green-primary">{value}</p>
      </div>
      {icon && <span className="text-3xl">{icon}</span>}
    </div>
  </div>
);

export default DashboardPage;
