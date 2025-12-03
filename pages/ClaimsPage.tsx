import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../services/api';
import { useNotification } from '../hooks/useNotification';

const ClaimsPage = () => {
    const [searchParams] = useSearchParams();
    const listingId = searchParams.get('listingId');
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const [reasonType, setReasonType] = useState('inapropiado');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listingId) {
            addNotification("Error: No se identificó la publicación.", "error");
            return;
        }

        setLoading(true);
        const fullReason = `[${reasonType.toUpperCase()}] ${description}`;

        try {
            await api.createClaim({
                listingId: Number(listingId),
                reason: fullReason
            });
            addNotification("Reporte enviado correctamente. Los administradores revisarán el caso.", "success");
            navigate(`/listings/${listingId}`);
        } catch (error) {
            console.error(error);
            addNotification("Error al enviar el reporte.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <span className="text-4xl">⚠️</span>
                    <h1 className="text-2xl font-bold text-gray-800 mt-4">Reportar Publicación</h1>
                    <p className="text-gray-500 mt-2">Ayúdanos a mantener la comunidad segura.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-4">Selecciona el motivo del reporte:</label>
                        <div className="space-y-3">
                            {[
                                { value: 'inapropiado', label: 'Contenido Inapropiado / Ofensivo' },
                                { value: 'fraude', label: 'Posible Fraude o Estafa' },
                                { value: 'articulo_prohibido', label: 'Artículo Prohibido' },
                                { value: 'spam', label: 'Spam / Publicidad' },
                                { value: 'otro', label: 'Otro' }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={option.value}
                                        checked={reasonType === option.value}
                                        onChange={(e) => setReasonType(e.target.value)}
                                        className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-gray-700 font-medium">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {reasonType === 'otro' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Detalles del problema</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                rows={4}
                                placeholder="Por favor describe el problema..."
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            ></textarea>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md disabled:bg-gray-400"
                        >
                            {loading ? "Enviando..." : "Enviar Reporte"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClaimsPage;
