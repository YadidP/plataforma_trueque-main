import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { Exchange } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const ExchangesPage = () => {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true);
      try {
        const data = await api.getMyExchanges();
        setExchanges(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-8 pt-6">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mis Intercambios</h1>
            <p className="text-gray-500 mt-1">Historial de tus compras y ventas.</p>
        </div>
        <Link to="/listings" className="hidden sm:block bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-sm">
            Explorar más
        </Link>
      </div>

      {exchanges.length > 0 ? (
        <div className="grid gap-4">
          {exchanges.map(ex => {
            const isBuyer = ex.buyerId === user?.id;
            return (
              <div key={ex.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Icono y Detalles Principales */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${isBuyer ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isBuyer ? '🛒' : '🏷️'}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{ex.listingTitle}</h3>
                        <p className="text-sm text-gray-500">
                            {new Date(ex.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Detalles de la Transacción */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-8 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Rol</p>
                        <span className={`text-sm font-bold ${isBuyer ? 'text-orange-600' : 'text-blue-600'}`}>
                            {isBuyer ? 'Compraste' : 'Vendiste'}
                        </span>
                    </div>
                    
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Contraparte</p>
                        <span className="text-sm font-medium text-gray-700">
                            {isBuyer ? ex.sellerName : ex.buyerName}
                        </span>
                    </div>

                    <div className="text-right min-w-[80px]">
                        <p className="text-xs text-gray-400 uppercase font-bold">Monto</p>
                        <span className={`text-xl font-extrabold ${isBuyer ? 'text-red-500' : 'text-green-500'}`}>
                            {isBuyer ? '-' : '+'}{ex.totalCredits}
                        </span>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-700">Aún no hay movimientos</h3>
          <p className="text-gray-500 mt-2 mb-6">Cuando realices tu primer trueque, aparecerá aquí.</p>
          <Link to="/listings" className="text-green-600 font-bold hover:underline text-lg">
            Ir a Explorar
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExchangesPage;