import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-green-primary text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-green-100 transition-colors">
          EcoTrade
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/listings" className="hover:text-green-100 transition-colors font-semibold">
            Explorar
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="hover:text-green-100 transition-colors font-semibold">
                Dashboard
              </Link>
              <Link to="/wallet" className="hover:text-green-100 transition-colors font-semibold">
                Mi Billetera
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hover:text-green-100 transition-colors font-semibold">
                  Admin
                </Link>
              )}
            </>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">Hola, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-white text-green-primary px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-semibold"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-green-primary px-4 py-2 rounded-lg hover:bg-green-100 transition-colors font-semibold"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
