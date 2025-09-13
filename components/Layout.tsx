
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-green-primary text-white text-center p-4">
        <p>&copy; {new Date().getFullYear()} Créditos Verdes. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;
