import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification'; // Importar notificaciones

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotification();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  
  // Estados para Calificación
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Recarga datos del perfil
  const loadProfile = async () => {
    setLoading(true);
    try {
        if(!id) return;
        const data = await api.getUserProfile(Number(id));
        setProfile(data);
        setBio(data.bio || '');
    } catch (e) { 
        console.error(e);
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { loadProfile(); }, [id]);

  const handleSaveBio = async () => {
    try {
        await api.updateBio(bio);
        setEditing(false);
        setProfile({ ...profile, bio });
    } catch (e) {
        addNotification("Error al guardar la biografía", "error");
    }
  };

  // Enviar reseña desde el perfil
  const handleSubmitReview = async () => {
    if (rating === 0) {
        addNotification('Selecciona una calificación.', 'error');
        return;
    }
    setSubmittingReview(true);
    try {
        await api.rateUser({
            targetId: profile.id,
            exchangeId: profile.pendingReviewExchangeId, // Usamos el ID que nos dio el backend
            rating,
            comment
        });
        addNotification('¡Reseña publicada!', 'success');
        setRatingModalOpen(false);
        setRating(0);
        setComment('');
        loadProfile(); // Recargar para ver la nueva reseña y quitar el botón
    } catch (error: any) {
        addNotification('Error al enviar reseña.', 'error');
    } finally {
        setSubmittingReview(false);
    }
  };

  const getImpactStyle = (code: string) => {
    switch(code) {
        case 'CO2': return { icon: '☁️', color: 'text-gray-600', bg: 'bg-gray-100', label: 'Huella Carbono' };
        case 'WATER': return { icon: '💧', color: 'text-blue-600', bg: 'bg-blue-50', label: 'Agua Ahorrada' };
        case 'ENERGY': return { icon: '⚡', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Energía' };
        case 'WASTE': return { icon: '♻️', color: 'text-green-600', bg: 'bg-green-50', label: 'Residuos' };
        case 'TREES': return { icon: '🌳', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Árboles Eq.' };
        default: return { icon: '🌱', color: 'text-green-600', bg: 'bg-green-50', label: 'Impacto' };
    }
  };

  if (loading) return <Spinner />;
  if (!profile) return <div className="text-center py-10">Usuario no encontrado</div>;

  const isOwnProfile = currentUser?.id === profile.id;
  const averageRating = profile.stats?.average ? Number(profile.stats.average) : 0;
  const reviewCount = profile.stats?.count ? Number(profile.stats.count) : 0;
  const impactData = profile.impact || [];
  const reviewsList = profile.reviews || [];

  return (
    <div className="max-w-5xl mx-auto p-4 pb-12 pt-8">
      
      {/* 1. Header del Perfil */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-green-800 to-emerald-600 relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="px-8 pb-8 text-center relative">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-5xl mx-auto -mt-16 border-4 border-white shadow-lg font-bold text-green-800 relative z-10">
                {profile.name?.charAt(0).toUpperCase()}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mt-4">{profile.name}</h1>
            <p className="text-gray-500 text-sm mb-4">{profile.email}</p>
            
            <div className="flex justify-center items-center gap-2 mb-6">
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                    <span className="text-yellow-500 text-lg mr-1">★</span>
                    <span className="font-bold text-gray-800">{averageRating.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs ml-1">({reviewCount} reseñas)</span>
                </div>
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-100">
                     <span className="text-green-600 text-xs font-bold uppercase">{profile.role}</span>
                </div>
            </div>
            
            {/* BOTÓN DE CALIFICAR (Solo si hay intercambio pendiente) */}
            {profile.pendingReviewExchangeId && !isOwnProfile && (
                <div className="mb-6">
                    <button 
                        onClick={() => setRatingModalOpen(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-md transition-transform hover:scale-105 flex items-center gap-2 mx-auto"
                    >
                        <span>★</span> Dejar Reseña Pendiente
                    </button>
                    <p className="text-xs text-gray-400 mt-1">Tienes un intercambio completado sin calificar con este usuario.</p>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {editing ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in fade-in">
                        <textarea 
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white" 
                            rows={3} 
                            value={bio} 
                            onChange={e => setBio(e.target.value)} 
                            placeholder="Escribe algo sobre ti..."
                        />
                        <div className="flex gap-3 justify-end mt-3">
                            <button onClick={() => setEditing(false)} className="text-gray-600 hover:bg-gray-200 px-4 py-1.5 rounded-lg text-sm font-medium transition">Cancelar</button>
                            <button onClick={handleSaveBio} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm transition">Guardar</button>
                        </div>
                    </div>
                ) : (
                    <div className="relative group cursor-pointer inline-block" onClick={() => isOwnProfile && setEditing(true)}>
                        <p className={`text-gray-600 leading-relaxed ${!profile.bio && 'italic text-gray-400'}`}>
                            "{profile.bio || 'Este usuario aún no ha añadido una descripción.'}"
                        </p>
                        {isOwnProfile && (
                            <span className="opacity-0 group-hover:opacity-100 absolute -right-8 top-0 text-blue-500 text-sm transition-opacity bg-blue-50 p-1 rounded hover:bg-blue-100" title="Editar">✏️</span>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Sección de Impacto Ambiental */}
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full">
                <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center gap-2">
                    <span className="bg-green-100 p-2 rounded-lg text-lg">🌍</span> Impacto Positivo Generado
                </h3>
                
                {impactData.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {impactData.map((imp: any, i: number) => {
                            const style = getImpactStyle(imp.metric_code);
                            return (
                                <div key={i} className={`${style.bg} p-4 rounded-2xl border border-transparent hover:border-gray-200 transition-all text-center flex flex-col justify-center items-center`}>
                                    <div className="text-3xl mb-2">{style.icon}</div>
                                    <div className={`text-2xl font-extrabold ${style.color}`}>
                                        {Number(imp.total) >= 1000 ? (Number(imp.total)/1000).toFixed(1) + 'k' : Number(imp.total).toFixed(1)}
                                    </div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">
                                        {imp.metric_unit}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-medium bg-white/50 px-2 py-0.5 rounded-full">
                                        {style.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="text-4xl opacity-30 mb-2">🌱</div>
                        <p className="text-gray-400 text-sm font-medium">Este usuario aún no ha registrado impacto ambiental.</p>
                    </div>
                )}
            </div>
        </div>

        {/* 3. Sección de Reseñas */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
                <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center gap-2">
                    <span className="bg-yellow-100 p-2 rounded-lg text-lg">💬</span> Últimas Reseñas
                </h3>
                
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {reviewsList.length > 0 ? reviewsList.map((rev: any, i: number) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-900 text-sm">{rev.reviewer_name}</span>
                                <span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex text-yellow-400 text-xs mb-2">
                                {'★'.repeat(rev.rating)}
                                <span className="text-gray-300">{'★'.repeat(5 - rev.rating)}</span>
                            </div>
                            <p className="text-gray-600 text-sm italic">"{rev.comment}"</p>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-400 text-sm italic">
                            Aún no ha recibido reseñas.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* MODAL DE CALIFICACIÓN (Reutilizado) */}
      {ratingModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="font-bold text-xl text-gray-800 mb-4">Calificar a {profile.name}</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tu Calificación</label>
                    <div className="flex gap-1 text-2xl justify-center py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                                key={star}
                                className={`cursor-pointer transform transition hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
                        onClick={() => { setRatingModalOpen(false); setRating(0); }}
                        className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md disabled:bg-gray-300 disabled:shadow-none"
                    >
                        {submittingReview ? 'Enviando...' : 'Publicar Reseña'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
