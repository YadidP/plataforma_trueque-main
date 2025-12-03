import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { Campaign } from '../types';
import Spinner from '../components/Spinner';
import CampaignCard from '../components/CampaignCard';
import CreateCampaignModal from '../components/CreateCampaignModal'; // Importar
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth'; // Importar auth

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // Estado modal
  
  const { addNotification } = useNotification();
  const { user } = useAuth(); // Obtener usuario para verificar rol

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error(error);
      addNotification('Error al cargar campañas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
        await api.updateCampaign(id, { status: newStatus as any });
        addNotification(`Campaña ${newStatus === 'active' ? 'activada' : 'pausada'} correctamente`, 'success');
        // Actualización optimista: Refrescar lista completa para asegurar consistencia
        fetchCampaigns();
    } catch (error) {
        addNotification('No se pudo actualizar el estado', 'error');
    }
  };

  const isEntrepreneur = user?.role === 'emprendedor' || user?.role === 'admin';

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Banner con Botón Crear */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-12 px-4 shadow-lg mb-8 relative">
        <div className="max-w-7xl mx-auto text-center">
            <span className="text-4xl mb-4 block">🎉</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Campañas y Ofertas</h1>
            <p className="text-purple-200 text-lg max-w-2xl mx-auto mb-6">
                Descubre las mejores oportunidades de nuestros emprendedores.
            </p>
            
            {isEntrepreneur && (
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-purple-50 transition transform hover:-translate-y-1"
                >
                    + Crear Nueva Oferta
                </button>
            )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map(camp => (
                    <CampaignCard 
                        key={camp.id} 
                        campaign={camp} 
                        onUpdateStatus={handleUpdateStatus} 
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-5xl mb-4 opacity-30">🎈</div>
                <h3 className="text-xl font-bold text-gray-400">No hay campañas activas en este momento</h3>
                <p className="text-gray-400 mt-2">¡Vuelve pronto para ver nuevas ofertas!</p>
            </div>
        )}
      </div>

      {showModal && (
        <CreateCampaignModal 
            onClose={() => setShowModal(false)}
            onSuccess={() => {
                setShowModal(false);
                addNotification("Campaña creada exitosamente", "success");
                fetchCampaigns();
            }}
        />
      )}
    </div>
  );
};

export default CampaignsPage;