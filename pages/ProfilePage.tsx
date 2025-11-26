import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
        setLoading(true);
        try {
            if(!id) return;
            const data = await api.getUserProfile(Number(id));
            setProfile(data);
            setBio(data.bio || '');
        } catch (e) { 
            console.error(e);
            setError('No se pudo cargar el perfil.');
        } finally { 
            setLoading(false); 
        }
    };
    load();
  }, [id]);

  const handleSaveBio = async () => {
    try {
        await api.updateBio(bio);
        setEditing(false);
        setProfile({ ...profile, bio });
    } catch (e) {
        alert("Error al guardar la biografía");
    }
  };

  if (loading) return <Spinner />;
  if (error || !profile) return <div className="text-center py-10 text-red-500">{error || 'Usuario no encontrado'}</div>;

  const isOwnProfile = currentUser?.id === profile.id;
  
  // Cálculos seguros (evita pantalla blanca)
  const averageRating = profile.stats?.average ? Number(profile.stats.average) : 0;
  const reviewCount = profile.stats?.count ? Number(profile.stats.count) : 0;
  const impactData = profile.impact || [];
  const reviewsList = profile.reviews || [];

  return (
    <div className="max-w-4xl mx-auto p-4 pb-12">
      {/* Header Perfil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-green-900/10"></div>
        <div className="relative z-10">
            <div className="w-24 h-24 bg-green-900 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-md font-bold">
                {profile.name?.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
            <div className="flex justify-center items-center gap-2 mt-2 text-yellow-500 font-bold text-lg">
                <span>★</span> {averageRating.toFixed(1)} <span className="text-gray-400 text-sm font-normal">({reviewCount} reseñas)</span>
            </div>
            
            <div className="mt-6 max-w-xl mx-auto">
                {editing ? (
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <textarea 
                            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
                            rows={3} 
                            value={bio} 
                            onChange={e => setBio(e.target.value)} 
                            placeholder="Escribe algo sobre ti..."
                        />
                        <div className="flex gap-2 justify-end mt-2">
                            <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3">Cancelar</button>
                            <button onClick={handleSaveBio} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold">Guardar</button>
                        </div>
                    </div>
                ) : (
                    <div className="relative group cursor-pointer" onClick={() => isOwnProfile && setEditing(true)}>
                        <p className={`text-gray-600 italic ${!profile.bio && 'opacity-50'}`}>
                            "{profile.bio || 'Este usuario no ha añadido una descripción.'}"
                        </p>
                        {isOwnProfile && (
                            <span className="opacity-0 group-hover:opacity-100 absolute -right-6 top-0 text-blue-500 text-xs transition-opacity">✎</span>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Impacto */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                <span>🌍</span> Impacto Generado
            </h3>
            {impactData.length > 0 ? (
                <ul className="space-y-3">
                    {impactData.map((imp: any, i: number) => (
                        <li key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0">
                            <span className="text-gray-600 text-sm">{imp.metric_name}</span>
                            <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                                {Number(imp.total).toFixed(1)} {imp.metric_unit}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                    Sin impacto registrado aún.
                </div>
            )}
        </div>

        {/* Reseñas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                <span>💬</span> Últimas Reseñas
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {reviewsList.length > 0 ? reviewsList.map((rev: any, i: number) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 text-sm">{rev.reviewer_name}</span>
                            <div className="flex text-yellow-400 text-xs">
                                {'★'.repeat(rev.rating)}
                                <span className="text-gray-300">{'★'.repeat(5 - rev.rating)}</span>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">"{rev.comment}"</p>
                        <div className="text-xs text-gray-400 mt-2 text-right">
                            {new Date(rev.created_at).toLocaleDateString()}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        Aún no ha recibido reseñas.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;