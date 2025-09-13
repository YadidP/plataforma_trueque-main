
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { Exchange } from '../types';
import Spinner from '../components/Spinner';

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
        console.error("Error al cargar los intercambios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-green-dark mb-8">Mis Intercambios</h1>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-primary text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Fecha</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Artículo</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rol</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Otra Parte</th>
              <th className="text-right py-3 px-4 uppercase font-semibold text-sm">Créditos</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {exchanges.length > 0 ? exchanges.map(ex => {
              const isBuyer = ex.buyerId === user?.id;
              return (
                <tr key={ex.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4">{new Date(ex.date).toLocaleDateString('es-ES')}</td>
                  <td className="py-3 px-4">{ex.listingTitle}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${isBuyer ? 'bg-orange-200 text-orange-800' : 'bg-blue-200 text-blue-800'}`}>
                      {isBuyer ? 'Comprador' : 'Vendedor'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{isBuyer ? ex.sellerName : ex.buyerName}</td>
                  <td className={`py-3 px-4 text-right font-bold ${isBuyer ? 'text-red-600' : 'text-green-600'}`}>
                    {isBuyer ? `-${ex.totalCredits}` : `+${ex.totalCredits}`}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  No has realizado ningún intercambio todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExchangesPage;
