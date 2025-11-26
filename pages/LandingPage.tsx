import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-white font-sans">
      {/* Hero Section Limpio y Moderno */}
      <div className="relative bg-green-900 text-white pt-24 pb-32 px-4 overflow-hidden">
        
        {/* Fondo decorativo sutil */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-400 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/50 border border-green-700/50 text-green-300 text-xs font-bold uppercase tracking-widest mb-6">
            <span>🌿</span> Economía Circular
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Intercambia bienes,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
              cuida el planeta.
            </span>
          </h1>
          
          <p className="text-xl text-green-100/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            Únete a la plataforma de trueque digital. Sin dinero real, solo créditos y un impacto positivo medible en tu huella ecológica.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-green-500 text-green-950 font-bold rounded-full shadow-lg shadow-green-900/50 hover:bg-green-400 hover:scale-105 transition-all"
            >
              Comenzar Gratis
            </Link>
            <Link 
              to="/listings" 
              className="px-8 py-4 bg-transparent border border-green-500/50 text-green-100 font-bold rounded-full hover:bg-green-800/50 transition-all"
            >
              Explorar Mercado
            </Link>
          </div>
        </div>
      </div>

      {/* Stats / Features - Diseño Flotante */}
      <div className="relative -mt-16 max-w-6xl mx-auto px-4 z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
                icon="🔄" 
                title="Trueque Simple" 
                desc="Publica lo que no usas y gana créditos para obtener lo que necesitas." 
            />
            <FeatureCard 
                icon="🌍" 
                title="Impacto Real" 
                desc="Visualiza cuánto CO2 y agua ahorras en cada transacción." 
            />
            <FeatureCard 
                icon="🛡️" 
                title="Seguro y Justo" 
                desc="Sistema de reputación y créditos para intercambios confiables." 
            />
        </div>
      </div>

      <div className="h-24"></div> {/* Espaciador final */}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
  </div>
);

export default LandingPage;
