import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import * as api from '../services/api';
import Spinner from '../components/Spinner';

const CampaignsPage = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para Emprendedor (Crear)
    const [showCreate, setShowCreate] = useState(false);
    const [newCamp, setNewCamp] = useState({ title: '', description: '', type: 'manual', rewardCredits: '', targetMetricCode: 'CO2', targetValue: '' });

    // Estados para Emprendedor (Pagar)
    const [payModal, setPayModal] = useState<any>(null);
    const [targetEmail, setTargetEmail] = useState('');

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const data = await api.getCampaigns();
            setCampaigns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createCampaign({
                ...newCamp,
                rewardCredits: Number(newCamp.rewardCredits),
                targetValue: newCamp.type === 'metrica' ? Number(newCamp.targetValue) : null
            });
            addNotification('Campaña creada exitosamente', 'success');
            setShowCreate(false);
            fetchCampaigns();
        } catch (e) {
            addNotification('Error al crear campaña', 'error');
        }
    };

    const handlePayManual = async () => {
        try {
            await api.rewardUserManual(payModal.id, targetEmail);
            addNotification(`¡${payModal.reward_credits} créditos enviados a ${targetEmail}!`, 'success');
            setPayModal(null);
            setTargetEmail('');
        } catch (e: any) {
            addNotification(e.response?.data?.message || 'Error en el pago', 'error');
        }
    };

    const handleClaim = async (campaignId: number) => {
        try {
            const res = await api.claimCampaignReward(campaignId);
            addNotification(res.message, 'success');
            fetchCampaigns(); // Recargar para actualizar estado "participated"
        } catch (e: any) {
            addNotification(e.response?.data?.message || 'No cumples los requisitos aún', 'error');
        }
    };

    if (loading) return <Spinner />;

    const isEntrepreneur = user?.role === 'emprendedor';
    const isAdmin = user?.role === 'admin';

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-green-900">
                        {isEntrepreneur ? 'Gestión de Campañas' : 'Campañas e Incentivos'}
                    </h1>
                    <p className="text-gray-500">Participa en iniciativas y gana créditos.</p>
                </div>
                {isEntrepreneur && (
                    <button onClick={() => setShowCreate(!showCreate)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-green-700">
                        {showCreate ? 'Cancelar' : '+ Nueva Campaña'}
                    </button>
                )}
            </div>

            {/* FORMULARIO CREAR (SOLO EMPRENDEDOR) */}
            {showCreate && isEntrepreneur && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4">Crear Nueva Campaña</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="border p-2 rounded-lg" placeholder="Título" value={newCamp.title} onChange={e => setNewCamp({...newCamp, title: e.target.value})} required />
                        <input className="border p-2 rounded-lg" type="number" placeholder="Recompensa (Créditos)" value={newCamp.rewardCredits} onChange={e => setNewCamp({...newCamp, rewardCredits: e.target.value})} required />
                        <textarea className="border p-2 rounded-lg md:col-span-2" placeholder="Descripción" value={newCamp.description} onChange={e => setNewCamp({...newCamp, description: e.target.value})} required />
                        
                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                            <label className="font-bold block mb-2">Tipo de Campaña</label>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="type" checked={newCamp.type === 'manual'} onChange={() => setNewCamp({...newCamp, type: 'manual'})} />
                                    <span>Manual (Pago presencial/email)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="type" checked={newCamp.type === 'metrica'} onChange={() => setNewCamp({...newCamp, type: 'metrica'})} />
                                    <span>Automática (Por métricas de impacto)</span>
                                </label>
                            </div>
                            
                            {newCamp.type === 'metrica' && (
                                <div className="flex gap-4">
                                    <select className="border p-2 rounded-lg flex-1" value={newCamp.targetMetricCode} onChange={e => setNewCamp({...newCamp, targetMetricCode: e.target.value})}>
                                        <option value="CO2">Huella de Carbono (kg)</option>
                                        <option value="WATER">Agua Ahorrada (L)</option>
                                        <option value="WASTE">Residuos Evitados (kg)</option>
                                    </select>
                                    <input className="border p-2 rounded-lg flex-1" type="number" placeholder="Meta a alcanzar" value={newCamp.targetValue} onChange={e => setNewCamp({...newCamp, targetValue: e.target.value})} required />
                                </div>
                            )}
                        </div>
                        <button type="submit" className="bg-black text-white py-2 rounded-lg font-bold md:col-span-2 hover:bg-gray-800">Publicar Campaña</button>
                    </form>
                </div>
            )}

            {/* LISTA DE CAMPAÑAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {campaigns.map(camp => (
                    <div key={camp.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                        {/* Etiqueta Tipo */}
                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-xs font-bold text-white ${camp.type === 'manual' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                            {camp.type === 'manual' ? 'INTERACCIÓN MANUAL' : 'META AUTOMÁTICA'}
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 pr-20">{camp.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">Por: {isEntrepreneur ? 'Mí' : camp.entrepreneur_name}</p>
                        <p className="text-gray-600 mb-4 line-clamp-3">{camp.description}</p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <div className="text-2xl font-extrabold text-green-600">
                                {camp.reward_credits} <span className="text-xs text-gray-400 font-medium">créditos</span>
                            </div>

                            {/* ACCIONES SEGÚN ROL */}
                            {isEntrepreneur ? (
                                camp.type === 'manual' && (
                                    <button 
                                        onClick={() => setPayModal(camp)}
                                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200"
                                    >
                                        Pagar a Usuario
                                    </button>
                                )
                            ) : (
                                camp.type === 'metrica' ? (
                                    <button 
                                        onClick={() => handleClaim(camp.id)}
                                        disabled={camp.participated}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${camp.participated ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                                    >
                                        {camp.participated ? '¡Completado!' : 'Reclamar Recompensa'}
                                    </button>
                                ) : (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                        Visita al emprendedor
                                    </span>
                                )
                            )}
                        </div>
                        
                        {camp.type === 'metrica' && (
                            <div className="mt-3 text-xs text-purple-600 bg-purple-50 p-2 rounded-lg inline-block">
                                🎯 Meta: {camp.target_value} {camp.target_metric_code === 'CO2' ? 'kg CO2' : camp.target_metric_code}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* MODAL DE PAGO MANUAL (EMPRENDEDOR) */}
            {payModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
                        <h3 className="font-bold text-xl mb-2">Pagar Recompensa</h3>
                        <p className="text-sm text-gray-500 mb-4">Campaña: {payModal.title}</p>
                        
                        <label className="block text-sm font-bold mb-1">Correo del Usuario</label>
                        <input 
                            type="email" 
                            className="w-full border p-3 rounded-xl mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="usuario @email.com"
                            value={targetEmail}
                            onChange={e => setTargetEmail(e.target.value)}
                        />
                        
                        <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 mb-4">
                            ⚠️ Se descontarán <strong>{payModal.reward_credits} créditos</strong> de tu billetera personal.
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setPayModal(null)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
                            <button onClick={handlePayManual} className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-bold">Confirmar Pago</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsPage;