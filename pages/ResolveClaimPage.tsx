import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useNotification } from '../hooks/useNotification';
import Spinner from '../components/Spinner';

const ResolveClaimPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    
    const [claim, setClaim] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [deleteListing, setDeleteListing] = useState(false);
    const [banType, setBanType] = useState('none'); // none, 7days, custom, permanent
    const [banUntil, setBanUntil] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                if(!id) return;
                const data = await api.getClaimById(Number(id));
                setClaim(data);
            } catch (e) {
                addNotification('Error cargando reclamo', 'error');
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminNotes.trim()) {
            addNotification('Debes escribir una nota/razón para el usuario.', 'error');
            return;
        }
        
        setSubmitting(true);
        try {
            await api.resolveClaim(Number(id), {
                deleteListing,
                banType,
                banUntil: banType === 'custom' ? new Date(banUntil).toISOString() : undefined,
                adminNotes
            });
            addNotification('Reclamo resuelto y acciones aplicadas.', 'success');
            navigate('/admin');
        } catch (error) {
            addNotification('Error al procesar la resolución.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner />;
    if (!claim) return null;

    return (
        <div className="max-w-3xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Resolver Reclamo #{claim.id}</h1>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-bold">Reportado por:</span> {claim.claimant_name}</div>
                    <div><span className="font-bold">Publicación:</span> {claim.listing_title}</div>
                    <div><span className="font-bold">Autor (Acusado):</span> {claim.author_name}</div>
                    <div><span className="font-bold">Motivo:</span> {claim.reason}</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                
                {/* 1. Acción sobre la Publicación */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={deleteListing} 
                            onChange={e => setDeleteListing(e.target.checked)}
                            className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="font-bold text-gray-800">Eliminar Publicación (Marcar como eliminada)</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-8">La publicación dejará de ser visible en el mercado.</p>
                </div>

                {/* 2. Acción sobre el Usuario */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3">Sanción al Usuario ({claim.author_name})</h3>
                    <div className="space-y-2">
                        {[
                            { val: 'none', label: 'Sin Sanción (Solo advertencia)' },
                            { val: '7days', label: 'Suspender 7 Días' },
                            { val: 'custom', label: 'Fecha Personalizada' },
                            { val: 'permanent', label: 'Ban Permanente' },
                        ].map(opt => (
                            <label key={opt.val} className="flex items-center gap-3">
                                <input 
                                    type="radio" 
                                    name="banType" 
                                    value={opt.val}
                                    checked={banType === opt.val}
                                    onChange={e => setBanType(e.target.value)}
                                    className="text-red-600 focus:ring-red-500"
                                />
                                <span>{opt.label}</span>
                            </label>
                        ))}
                    </div>

                    {banType === 'custom' && (
                        <div className="mt-3 ml-6 animate-in fade-in">
                            <label className="text-sm font-bold block mb-1">Suspender hasta:</label>
                            <input 
                                type="date" 
                                required 
                                value={banUntil}
                                onChange={e => setBanUntil(e.target.value)}
                                className="border p-2 rounded-lg"
                            />
                        </div>
                    )}
                </div>

                {/* 3. Notificación */}
                <div>
                    <label className="block font-bold text-gray-700 mb-2">Mensaje de Resolución / Razón del Ban</label>
                    <textarea 
                        required
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        rows={4}
                        placeholder="Explica al usuario por qué se tomó esta decisión (esto se le mostrará al intentar entrar)..."
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/admin')} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" disabled={submitting} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md">
                        {submitting ? 'Procesando...' : 'Confirmar Resolución'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ResolveClaimPage;