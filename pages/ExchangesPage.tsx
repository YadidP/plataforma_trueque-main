import React, { useEffect, useState, useCallback } from 'react';
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
  const [filter, setFilter] = useState<'todos' | 'proceso' | 'completados'>('todos');
  
  // Rating states (ya existían)
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchExchanges = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getMyExchanges();
      setExchanges(data);
    } catch (error) {
      console.error("Error:", error);
      addNotification("Error al cargar intercambios.", "error");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => { fetchExchanges(); }, [fetchExchanges]);

  // ACCIONES DE CONFIRMACIÓN / CANCELACIÓN
  const handleConfirm = async (id: number) => {
    if(!window.confirm("¿Confirmas que recibiste el producto? Los créditos se liberarán al vendedor.")) return;
    try {
        await api.confirmExchange(id);
        addNotification("Intercambio completado exitosamente", "success");
        fetchExchanges();
    } catch (e: any) { addNotification(e.response?.data?.message || "Error al confirmar", "error"); }
  };

  const handleCancel = async (id: number) => {
    if(!window.confirm("¿Deseas cancelar y recibir el reembolso de tus créditos?")) return;
    try {
        await api.cancelExchange(id);
        addNotification("Intercambio cancelado y reembolsado", "success");
        fetchExchanges();
    } catch (e: any) { addNotification(e.response?.data?.message || "Error al cancelar", "error"); }
  };

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

  // Lógica de Filtrado
  const filteredExchanges = exchanges.filter(ex => {
    if (filter === 'proceso') return ex.status === 'pendiente';
    if (filter === 'completados') return ex.status === 'completado' || ex.status === 'cancelado';
    return true;
  });

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pt-6 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Mis Intercambios</h1>
            <p className="text-gray-500 mt-1">Gestiona tus compras y ventas.</p>
        </div>
        
        {/* FILTROS */}
        <div className="bg-gray-100 p-1 rounded-xl flex">
            <button onClick={() => setFilter('todos')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${filter === 'todos' ? 'bg-white shadow text-green-700' : 'text-gray-500'}`}>Todos</button>
            <button onClick={() => setFilter('proceso')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${filter === 'proceso' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>En Proceso ⏳</button>
            <button onClick={() => setFilter('completados')} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${filter === 'completados' ? 'bg-white shadow text-gray-700' : 'text-gray-500'}`}>Historial</button>
        </div>
      </div>

      {filteredExchanges.length > 0 ? (
        <div className="grid gap-4">
          {filteredExchanges.map(ex => {
            const isBuyer = ex.buyerId === user?.id;
            const isPending = ex.status === 'pendiente';

            return (
              <div key={ex.id} className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${isPending ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}>
                
                {/* Info Principal */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0 ${isBuyer ? 'bg-white border-2 border-orange-100' : 'bg-white border-2 border-blue-100'}`}>
                        {isBuyer ? '🛒' : '🏷️'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800 text-lg">{ex.listingTitle}</h3>
                            {isPending && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">Retenido</span>}
                            {ex.status === 'cancelado' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Cancelado</span>}
                        </div>
                        <p className="text-sm text-gray-500">
                            {new Date(ex.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Info Transacción */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                    <div className="text-center sm:text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold">Contraparte</p>
                        <span className="text-sm font-medium text-gray-700">
                            {isBuyer ? ex.sellerName : ex.buyerName}
                        </span>
                    </div>

                    <div className="text-right min-w-[80px]">
                        <p className="text-xs text-gray-400 uppercase font-bold">Total</p>
                        <span className={`text-xl font-extrabold ${ex.status === 'cancelado' ? 'text-gray-400 line-through' : (isBuyer ? 'text-red-500' : 'text-green-500')}`}>
                            {isBuyer ? '-' : '+'}{ex.totalCredits}
                        </span>
                    </div>
                </div>

                {/* BOTONES DE ACCIÓN (Solo para Comprador en estado Pendiente) */}
                {isBuyer && isPending && (
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        <button 
                            onClick={() => handleCancel(ex.id)}
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => handleConfirm(ex.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-700 shadow-md shadow-green-200"
                        >
                            Confirmar Recibido
                        </button>
                    </div>
                )}
                
                {/* Mensaje para el Vendedor si está pendiente */}
                {!isBuyer && isPending && (
                     <div className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-lg">
                        Esperando confirmación del comprador...
                     </div>
                )}

                {/* Calificación (Solo si completado y comprado) */}
                {isBuyer && ex.status === 'completado' && (
                    <button 
                        onClick={() => setRatingModal({ targetId: ex.sellerId, exchangeId: ex.id, name: ex.sellerName })}
                        className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 font-bold"
                    >
                        ★ Calificar
                    </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No hay intercambios en esta categoría.</p>
        </div>
      )}

      {/* Modal de Rating (Mismo código que tenías) */}
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
