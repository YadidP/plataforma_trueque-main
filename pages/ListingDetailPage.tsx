import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';
import { Listing, ListingStatus, Wallet } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import Spinner from '../components/Spinner';

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      if (id) {
        try {
          const listingId = parseInt(id);
          const listingData = await api.getListingById(listingId);
          setListing(listingData);

          const categoryData = await api.getCategoryById(listingData.categoryId);
          setCategoryName(categoryData?.name || 'Desconocida');

          if (isAuthenticated && user) {
            const walletData = await api.getWallet();
            setWallet(walletData);
          }
        } catch (error) {
          console.error("Error al cargar la publicación:", error);
          addNotification('La publicación que buscas no existe o no está disponible.', 'error');
          navigate('/listings'); // Redirigir a la página de listados
        } finally {
          setLoading(false);
        }
      }
    };
    fetchListing();
  }, [id, isAuthenticated, user, navigate, addNotification]);

  const handleExchange = async () => {
    if (!listing || !user) return;
    
    if (wallet && wallet.balance < listing.unitCredits) {
        addNotification('Saldo insuficiente para completar esta operación.', 'error');
        return;
    }

    setExchangeLoading(true);
    try {
        await api.createExchange(listing.id, 1);
        addNotification('¡Intercambio realizado con éxito!', 'success');
        navigate('/exchanges');
    } catch(error) {
        // El interceptor de Axios ya extrae el mensaje de error del backend
        addNotification(`Error: ${error}`, 'error');
    } finally {
        setExchangeLoading(false);
        setIsConfirming(false);
    }
  };

  if (loading) return <Spinner />;
  if (!listing) return <p className="text-center">Cargando publicación...</p>; // Evita renderizar contenido vacío mientras redirige

  const isOwner = user?.id === listing.authorId;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={listing.imageUrl} alt={listing.title} className="w-full h-auto object-cover rounded-lg shadow-md" />
        </div>
        <div>
          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">{categoryName}</span>
          <h1 className="text-4xl font-bold text-green-dark mt-2 mb-4">{listing.title}</h1>
          <p className="text-gray-600 mb-4">Publicado por: <span className="font-semibold">{listing.authorName}</span></p>
          <p className="text-gray-700 text-lg mb-6">{listing.description}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-3xl font-extrabold text-green-primary">{listing.unitCredits} créditos</p>
            <p className="text-sm text-gray-600">por {listing.unitLabel}</p>
          </div>
          
          {isAuthenticated && !isOwner && listing.status === ListingStatus.ACTIVE && (
            <button
              onClick={() => setIsConfirming(true)}
              className="w-full bg-green-primary hover:bg-green-dark text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
            >
              Intercambiar ahora
            </button>
          )}

          {isOwner && <p className="text-center text-gray-500 italic">Esta es tu publicación.</p>}
          {!isAuthenticated && <p className="text-center text-gray-500"><Link to="/login" className="text-green-primary underline">Inicia sesión</Link> para intercambiar.</p>}
          {listing.status !== ListingStatus.ACTIVE && <p className="text-center font-bold text-red-600 p-3 bg-red-100 rounded">Esta publicación ya no está disponible.</p>}
        </div>
      </div>

      {isConfirming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">Confirmar Intercambio</h2>
            <p>Estás a punto de intercambiar <span className="font-bold">{listing.unitCredits} créditos</span> por "{listing.title}".</p>
            <p className="my-2">Tu saldo actual: {wallet?.balance || 0} créditos.</p>
            <p>Saldo después del intercambio: {(wallet?.balance || 0) - listing.unitCredits} créditos.</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setIsConfirming(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancelar</button>
              <button onClick={handleExchange} disabled={exchangeLoading} className="px-4 py-2 bg-green-primary text-white rounded hover:bg-green-dark disabled:bg-gray-400">
                {exchangeLoading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;
