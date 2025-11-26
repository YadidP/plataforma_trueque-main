import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  const location = useLocation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main key={key} className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-green-900 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-green-200/80">
          <div className="font-medium">
            &copy; {new Date().getFullYear()} Créditos Verdes. Todos los derechos reservados.
          </div>
          <div className="flex gap-4 mt-2 md:mt-0">
            <span className="hover:text-white transition cursor-pointer">Términos</span>
            <span className="hover:text-white transition cursor-pointer">Privacidad</span>
            <span className="hover:text-white transition cursor-pointer">Ayuda</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;