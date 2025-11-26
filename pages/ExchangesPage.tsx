import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { Exchange } from '../types';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { useNotification } from '../hooks/useNotification';


const ExchangesPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);


  useEffect(() => {
    const fetchExchanges = async () => {
      setLoading(true);
      try {
        const data = await api.getMyExchanges();
        setExchanges(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  const handleSubmitReview = async () => {
    if (!ratingModal || rating === 0) {
      addNotification('Por favor, selecciona una calificación.', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      await api.rateUser({
        targetId: ratingModal.targetId,
        exchangeId: ratingModal.exchangeId,
        rating: rating,
        comment: comment,
      });
      addNotification('¡Calificación enviada con éxito!', 'success');
      setRatingModal(null);
      setRating(0);
      setComment('');
      // Opcional: Refrescar la lista de intercambios o actualizar el estado para reflejar que ya se calificó
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Error al enviar calificación.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <div className="flex items-center justify-between mb-8 pt-6">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mis Intercambios</h1>
            <p className="text-gray-500 mt-1">Historial de tus compras y ventas.</p>
        </div>
        <Link to="/listings" className="hidden sm:block bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-sm">
            Explorar más
        </Link>
      </div>

      {exchanges.length > 0 ? (
        <div className="grid gap-4">
          {exchanges.map(ex => {
            const isBuyer = ex.buyerId === user?.id;
            return (
              <div key={ex.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Icono y Detalles Principales */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${isBuyer ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {isBuyer ? '🛒' : '🏷️'}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{ex.listingTitle}</h3>
                        <p className="text-sm text-gray-500">
                            {new Date(ex.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Detalles de la Transacción */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-8 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Rol</p>
                        <span className={`text-sm font-bold ${isBuyer ? 'text-orange-600' : 'text-blue-600'}`}>
                            {isBuyer ? 'Compraste' : 'Vendiste'}
                        </span>
                    </div>
                    
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Contraparte</p>
                        <span className="text-sm font-medium text-gray-700">
                            {isBuyer ? ex.sellerName : ex.buyerName}
                        </span>
                    </div>

                    <div className="text-right min-w-[80px]">
                        <p className="text-xs text-gray-400 uppercase font-bold">Monto</p>
                        <span className={`text-xl font-extrabold ${isBuyer ? 'text-red-500' : 'text-green-500'}`}>
                            {isBuyer ? '-' : '+'}{ex.totalCredits}
                        </span>
                    </div>
                </div>
                {isBuyer && (
                    <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                        <Link to={`/profile/${ex.sellerId}`} className="text-sm text-blue-600 hover:underline px-3 py-1">Ver Perfil</Link>
                        <button 
                            onClick={() => setRatingModal({ targetId: ex.sellerId, exchangeId: ex.id, name: ex.sellerName })}
                            className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 font-bold"
                        >
                            ★ Calificar
                        </button>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-700">Aún no hay movimientos</h3>
          <p className="text-gray-500 mt-2 mb-6">Cuando realices tu primer trueque, aparecerá aquí.</p>
          <Link to="/listings" className="text-green-600 font-bold hover:underline text-lg">
            Ir a Explorar
          </Link>
        </div>
      )}

    {ratingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="font-bold text-xl text-gray-800 mb-4">Calificar a {ratingModal.name}</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tu Calificación</label>
                    <div className="flex gap-1 text-2xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star}
                                className={`cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                onClick={() => setRating(star)}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comentario (opcional)</label>
                    <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comparte tu experiencia..."
                    ></textarea>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { setRatingModal(null); setRating(0); setComment(''); }}
                        className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md disabled:bg-gray-300 disabled:shadow-none"
                    >
                        {submittingReview ? 'Enviando...' : 'Enviar Calificación'}
                    </button>
                </div>
            </div>
        </div>
    )}
    </div>
  );
};

export default ExchangesPage;
