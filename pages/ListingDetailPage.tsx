import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';
import { Listing, ListingStatus, Wallet, ImpactMetricResult } from '../types';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
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
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { user, isAuthenticated } = useAuth();
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

          if (listingData.category) {
            setCategoryName(listingData.category.name || 'Desconocida');
          }

          if (isAuthenticated && user) {
            try {
              const walletData = await api.getWallet();
              setWallet(walletData);
            } catch (walletError) {
              console.warn("Error al cargar wallet:", walletError);
            }
          }
        } catch (error: any) {
          console.error("Error:", error);
          addNotification('Publicación no disponible.', 'error');
          navigate('/listings');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchListing();
  }, [id, isAuthenticated, navigate, addNotification, user]);

  const handleExchange = async () => {
    if (!listing || !user || !wallet) return;

    const totalCost = listing.unitCredits * quantity;

    // VALIDACIÓN DE SALDO CON REDIRECCIÓN
    if (Number(wallet.balance) < totalCost) {
      addNotification('Saldo insuficiente. Redirigiendo a tu billetera...', 'error');
      setTimeout(() => navigate('/wallet'), 2000); // Espera 2s y redirige
      return;
    }

    setExchangeLoading(true);
    try {
      await api.createExchange(listing.id, quantity);
      addNotification('¡Intercambio exitoso! Revisa tus movimientos.', 'success');
      navigate('/exchanges'); // REDIRECCIÓN A MIS INTERCAMBIOS
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Error al procesar', 'error');
    } finally {
      setExchangeLoading(false);
      setIsConfirming(false);
    }
  };

  // ... (handleReport se mantiene igual)

  if (loading) return <Spinner />;
  if (!listing) return <p className="text-center">Cargando...</p>;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : listing.imageUrl
      ? [{ imageUrl: listing.imageUrl } as any]
      : [];

  const isOwner = user?.id === listing.author?.id;

  // Helpers para iconos de impacto
  const getImpactIcon = (code: string) => {
    switch (code) {
      case 'CO2': return '☁️';
      case 'WATER': return '💧';
      case 'ENERGY': return '⚡';
      case 'WASTE': return '♻️';
      case 'TREES': return '🌳';
      default: return '🌱';
    }
  };

  const getImpactColor = (code: string) => {
    switch (code) {
      case 'CO2': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'WATER': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ENERGY': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'WASTE': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  // Calcular impacto proporcional a la cantidad seleccionada
  // listing.potentialImpact suele ser el total por toda la cantidad disponible o unitario dependiendo de tu implementación.
  // Asumiremos que el backend devolvió el cálculo basado en listing.quantity total.
  const calculateImpactForSelection = (metric: ImpactMetricResult) => {
    if (!listing.quantity) return 0;
    const unitImpact = metric.value / listing.quantity;
    return (unitImpact * quantity).toFixed(2);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-5xl mx-auto my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Imágenes */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl border border-gray-100 shadow-sm relative group">
            <img
              src={images[currentImageIndex]?.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="bg-white/80 p-2 rounded-full hover:bg-white">‹</button>
                <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="bg-white/80 p-2 rounded-full hover:bg-white">›</button>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 ${idx === currentImageIndex ? 'border-green-500' : 'border-transparent'}`}
                >
                  <img src={img.imageUrl} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Info */}
        <div className="flex flex-col">
          <div className="mb-auto">
            <div className="flex justify-between items-start">
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{categoryName}</span>
              <span className="text-xs text-gray-400">{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mt-3 mb-2 leading-tight">{listing.title}</h1>
            <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
              Publicado por <span className="font-semibold text-gray-700 flex items-center gap-1">👤 {listing.author?.name}</span>
            </p>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">{listing.description}</p>

            {/* SECCIÓN DE IMPACTO VISUAL */}
            {listing.potentialImpact && listing.potentialImpact.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-5 rounded-xl border border-emerald-100 mb-6">
                <h3 className="text-green-800 font-bold flex items-center gap-2 mb-3">
                  <span className="text-xl">🌍</span> Impacto Ambiental Potencial
                </h3>
                <p className="text-xs text-gray-600 mb-3">Al adquirir este artículo en lugar de uno nuevo, evitas:</p>
                <div className="flex flex-wrap gap-2">
                  {listing.potentialImpact.map((m) => (
                    <div key={m.code} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getImpactColor(m.code)} bg-white shadow-sm`}>
                      <span>{getImpactIcon(m.code)}</span>
                      <div>
                        <span className="block text-sm font-bold">{m.value} {m.unit}</span>
                        <span className="block text-[10px] uppercase tracking-wider opacity-70">{m.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-green-600">{listing.unitCredits}</span>
              <span className="text-lg text-gray-500 font-medium mb-1">créditos / {listing.unitLabel}</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Stock disponible: {listing.quantity}</p>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {isAuthenticated ? (
              !isOwner && listing.status === ListingStatus.ACTIVE ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-6 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1"
                  >
                    Intercambiar Ahora
                  </button>
                  <button
                    onClick={() => setIsReporting(true)}
                    className="px-4 py-3 border border-gray-200 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                    title="Reportar"
                  >
                    ⚠️
                  </button>
                </div>
              ) : isOwner ? (
                <Link to={`/listings/edit/${listing.id}`} className="block w-full text-center bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition-colors">
                  Editar mi publicación
                </Link>
              ) : (
                <div className="bg-gray-100 text-gray-500 font-bold py-3 px-6 rounded-xl text-center">
                  No disponible
                </div>
              )
            ) : (
              <Link to="/login" className="block w-full text-center bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
                Inicia sesión para intercambiar
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN MEJORADO */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-green-600 p-4 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">🤝 Confirmar Trueque</h2>
              <button onClick={() => setIsConfirming(false)} className="text-white/80 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <img src={images[0]?.imageUrl} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{listing.title}</h3>
                  <p className="text-sm text-gray-500">Estás a punto de adquirir este artículo.</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Cuántos necesitas?</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val > 0 && val <= (listing.quantity || 1)) setQuantity(val);
                    }}
                    className="w-24 border-2 border-gray-300 rounded-lg px-3 py-2 text-center font-bold text-lg focus:border-green-500 focus:ring-0 outline-none"
                    min="1"
                    max={listing.quantity}
                  />
                  <span className="text-gray-500">{listing.unitLabel}</span>
                </div>
              </div>

              {/* RESUMEN DE COSTOS E IMPACTO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Costos */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-2">Balance Económico</div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Costo Total:</span>
                    <span className="font-bold text-gray-900">{listing.unitCredits * quantity} créditos</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tu Saldo:</span>
                    <span className="text-gray-900">{wallet?.balance}</span>
                  </div>
                  <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm">
                    <span>Restante:</span>
                    <span className={`font-bold ${(wallet?.balance || 0) - (listing.unitCredits * quantity) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {(wallet?.balance || 0) - (listing.unitCredits * quantity)}
                    </span>
                  </div>
                </div>

                {/* Impacto Dinámico */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="text-xs text-emerald-700 uppercase font-bold mb-2 flex items-center gap-1">
                    🌱 Impacto Generado
                  </div>
                  {listing.potentialImpact && listing.potentialImpact.length > 0 ? (
                    <div className="space-y-1">
                      {listing.potentialImpact.slice(0, 3).map(m => (
                        <div key={m.code} className="flex justify-between text-sm text-emerald-800">
                          <span>{m.name}:</span>
                          <span className="font-bold">+{calculateImpactForSelection(m)} {m.unit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 italic">Calculando beneficios...</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setIsConfirming(false)} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50">
                  Cancelar
                </button>
                
                {/* Lógica condicional del botón */}
                {(wallet?.balance || 0) < (listing.unitCredits * quantity) ? (
                    <button 
                        onClick={() => navigate('/wallet')}
                        className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 shadow-md"
                    >
                        Recargar Billetera
                    </button>
                ) : (
                    <button 
                        onClick={handleExchange} 
                        disabled={exchangeLoading}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md disabled:bg-gray-300"
                    >
                        {exchangeLoading ? 'Procesando...' : 'Confirmar Canje'}
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Reporte (básico) */}
      {isReporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                <h3 className="font-bold text-lg mb-2 text-red-600">Reportar Publicación</h3>
                <textarea 
                    className="w-full border p-2 rounded mb-4" 
                    rows={3} 
                    placeholder="Describe el problema..."
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsReporting(false)} className="text-gray-500 px-3">Cancelar</button>
                    <button onClick={handleReport} className="bg-red-600 text-white px-4 py-2 rounded">Enviar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetailPage;