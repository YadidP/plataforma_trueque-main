
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-9xl font-extrabold text-green-primary">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mt-4 mb-2">Página No Encontrada</h2>
      <p className="text-gray-600 mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
      <Link
        to="/"
        className="bg-green-primary hover:bg-green-dark text-white font-bold py-3 px-6 rounded-full transition-colors"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
