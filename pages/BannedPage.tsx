import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';

interface BannedPageProps {
  reason: string;
  expires: string;
}

const BannedPage: React.FC<BannedPageProps> = ({ reason, expires }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
      await api.logout();
      window.location.href = '/login'; // Forzar recarga completa
  };

  const isPermanent = expires === 'Permanente';
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = !isPermanent ? new Date(expires).toLocaleDateString('es-ES', dateOptions) : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100 text-center">
        <div className="bg-red-600 p-6">
            <span className="text-6xl block mb-2">🚫</span>
            <h1 className="text-3xl font-extrabold text-white uppercase tracking-wider">Cuenta Suspendida</h1>
        </div>
        
        <div className="p-10">
            <div className="mb-8">
                <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-2">Motivo de la sanción</h2>
                <p className="text-xl font-medium text-gray-800 bg-red-50 p-4 rounded-xl border border-red-100">
                    "{reason}"
                </p>
            </div>

            <div className="mb-10">
                <h2 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-2">Duración</h2>
                {isPermanent ? (
                    <span className="text-2xl font-extrabold text-red-600">PERMANENTE</span>
                ) : (
                    <div>
                        <span className="text-lg text-gray-600">Hasta el:</span>
                        <div className="text-2xl font-bold text-gray-900 mt-1">{formattedDate}</div>
                    </div>
                )}
            </div>

            <p className="text-sm text-gray-400 mb-6">
                Si crees que esto es un error, contacta a soporte @ecotrade.com
            </p>

            <button 
                onClick={handleLogout}
                className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg"
            >
                Entendido, cerrar sesión
            </button>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;