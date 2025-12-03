import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const BannedPage = () => {
    const location = useLocation();
    const { reason, until } = location.state || {};

    return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border-2 border-red-100">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-3xl font-extrabold text-red-600 mb-2">Cuenta Suspendida</h1>
                <p className="text-gray-600 mb-6">
                    Tu acceso ha sido restringido por violar nuestras normas de comunidad.
                </p>
                
                <div className="bg-red-50 p-4 rounded-xl text-left mb-6">
                    <p className="text-sm font-bold text-red-800 uppercase text-xs mb-1">Razón:</p>
                    <p className="text-gray-800 mb-3">{reason || 'Violación de términos y condiciones.'}</p>
                    
                    <p className="text-sm font-bold text-red-800 uppercase text-xs mb-1">Disponible nuevamente:</p>
                    <p className="text-gray-800 font-mono">
                        {until ? new Date(until).toLocaleString() : 'Indefinido'}
                    </p>
                </div>

                <Link to="/" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition">
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default BannedPage;