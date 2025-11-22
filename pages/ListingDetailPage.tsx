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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    
    // Forzamos Number() para asegurar comparación numérica matemática
    if (wallet && Number(wallet.balance) < Number(listing.unitCredits)) {
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
  if (!listing) return <p className="text-center">Cargando publicación...</p>;

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : listing.imageUrl 
    ? [{ imageUrl: listing.imageUrl } as any]
    : [];

  const currentImage = images[currentImageIndex];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const isOwner = user?.id === listing.authorId;

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <img 
            src={currentImage?.imageUrl} 
            alt={listing.title} 
            className="w-full h-auto object-cover rounded-lg shadow-md" 
            onError={(e) => {
              console.error(`Image error for detail listing ${listing.id}: src=${(e.target as HTMLImageElement).src}`); // Log if fails
              (e.target as HTMLImageElement).src = '/placeholder.jpg'; // Fallback if image fails to load
            }}
          />
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all"
              >
                ‹
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-all"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1}/{images.length}
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-12 h-12 rounded border-2 overflow-hidden transition-all ${
                      idx === currentImageIndex ? 'border-green-primary' : 'border-gray-300'
                    }`}
                  >
                    <img src={img.imageUrl} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
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
          
          <div className="flex flex-col gap-3 mt-6">
            {isAuthenticated && !isOwner && listing.status === ListingStatus.ACTIVE && (
              <button
                onClick={() => setIsConfirming(true)}
                className="w-full bg-green-primary hover:bg-green-dark text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors"
              >
                Intercambiar ahora
              </button>
            )}
            
            {isOwner && listing.status === ListingStatus.ACTIVE && (
              <Link 
                 to={`/listings/edit/${listing.id}`}
                 className="w-full text-center border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-lg text-lg transition-colors"
              >
                 ✏️ Editar Publicación
              </Link>
            )}
          </div>

          {!isAuthenticated && <p className="text-center text-gray-500 mt-4"><Link to="/login" className="text-green-primary underline">Inicia sesión</Link> para intercambiar.</p>}
          {listing.status !== ListingStatus.ACTIVE && <p className="text-center font-bold text-red-600 p-3 bg-red-100 rounded mt-4">Esta publicación ya no está disponible.</p>}
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
