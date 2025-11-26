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
    <header className="bg-green-900 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-green-900 font-extrabold text-xl shadow-sm group-hover:scale-105 transition-transform">
            E
          </div>
          <span className="text-xl font-bold tracking-tight text-green-50">EcoTrade</span>
        </Link>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/listings" className="text-green-100 hover:text-white font-medium transition-colors text-sm uppercase tracking-wide">
            Explorar
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-green-100 hover:text-white font-medium transition-colors text-sm uppercase tracking-wide">
                Dashboard
              </Link>

              {/* ENLACE RESTAURADO */}
              <Link to="/wallet" className="text-green-100 hover:text-white font-medium transition-colors text-sm uppercase tracking-wide">
                Mi Billetera
              </Link>

              {isAdmin && (
                <Link to="/admin" className="text-yellow-300 hover:text-yellow-100 font-medium transition-colors text-sm uppercase tracking-wide">
                  Admin
                </Link>
              )}

              <div className="h-6 w-px bg-green-700 mx-2"></div>

              <div className="flex items-center gap-4">
                <Link
                  to={`/profile/${user?.id}`}
                  className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full bg-green-800 hover:bg-green-700 transition-all border border-green-700"
                >
                  <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-green-50">{user?.name.split(' ')[0]}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-green-300 hover:text-red-400 transition-colors text-sm font-bold"
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-green-100 hover:text-white font-medium transition-colors">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="bg-white text-green-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-green-100 transition-all shadow-lg"
              >
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;