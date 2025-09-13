
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const activeLinkClass = "text-green-light font-bold";
  const inactiveLinkClass = "hover:text-green-light transition-colors";

  return (
    <header className="bg-green-primary text-white shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <Link to="/" className="text-2xl font-bold">
          Créditos Verdes
        </Link>
        <div className="flex items-center space-x-6 text-lg">
          <NavLink to="/listings" className={({isActive}) => isActive ? activeLinkClass : inactiveLinkClass}>Explorar</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({isActive}) => isActive ? activeLinkClass : inactiveLinkClass}>Dashboard</NavLink>
              <NavLink to="/wallet" className={({isActive}) => isActive ? activeLinkClass : inactiveLinkClass}>Mi Billetera</NavLink>
              {isAdmin() && <NavLink to="/admin" className={({isActive}) => isActive ? activeLinkClass : inactiveLinkClass}>Admin</NavLink>}
              <span className="text-gray-300">|</span>
              <span className="font-semibold">{user?.name}</span>
              <button onClick={handleLogout} className="bg-green-accent hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors">
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({isActive}) => isActive ? activeLinkClass : inactiveLinkClass}>Ingresar</NavLink>
              <Link to="/register" className="bg-green-accent hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
