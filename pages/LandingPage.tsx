
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-5xl font-extrabold text-green-dark mb-4">
        Bienvenido a Créditos Verdes
      </h1>
      <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
        La plataforma de trueque que recompensa tu participación en la economía circular. Publica, intercambia y mide tu impacto positivo en el ambiente y la comunidad.
      </p>
      <div className="space-x-4">
        <Link to="/register" className="bg-green-primary hover:bg-green-dark text-white font-bold py-3 px-8 rounded-full text-lg transition-colors">
          ¡Únete Ahora!
        </Link>
        <Link to="/listings" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full text-lg transition-colors">
          Explorar Artículos
        </Link>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-green-primary mb-2">Publica y Gana</h3>
          <p className="text-gray-600">Ofrece bienes que ya no usas o servicios que puedes prestar. ¡Gana créditos de incentivo por cada publicación!</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-green-primary mb-2">Intercambia con Créditos</h3>
          <p className="text-gray-600">Usa tus créditos para adquirir lo que necesitas, desde ropa y tecnología hasta clases particulares, sin usar dinero real.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-green-primary mb-2">Mide tu Impacto</h3>
          <p className="text-gray-600">Visualiza cuánto CO2 has evitado, la cantidad de productos reutilizados y las horas de servicio que has aportado a la comunidad.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
