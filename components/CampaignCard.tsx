import React from 'react';
import { Campaign } from '../types';
import { useAuth } from '../hooks/useAuth';

interface Props {
  campaign: Campaign;
  onUpdateStatus: (id: number, newStatus: string) => void;
}

const CampaignCard: React.FC<Props> = ({ campaign, onUpdateStatus }) => {
  const { user, isAdmin } = useAuth();
  
  // Permisos: Admin o Dueño
  const canEdit = isAdmin || (user && user.id === campaign.entrepreneurId);

  // Colores según tipo
  const isDiscount = campaign.type === 'discount';
  const bgColor = isDiscount ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100';
  const badgeColor = isDiscount ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
  const icon = isDiscount ? '🏷️' : '🎁';

  // Configuración legible
  const configText = isDiscount 
    ? `${campaign.config.discount_percent}% de Descuento` 
    : `Regalo por compras > ${campaign.config.min_amount} créditos`;

  return (
    <div className={`relative p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${bgColor} ${campaign.status === 'paused' ? 'opacity-75 grayscale' : ''}`}>
      
      {/* Badge Estado */}
      <div className="absolute top-4 right-4 flex gap-2">
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${badgeColor}`}>
            {campaign.type === 'discount' ? 'Oferta' : 'Regalo'}
        </span>
        {campaign.status === 'paused' && (
            <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-gray-200 text-gray-600">
                Pausada
            </span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl">{icon}</div>
        <div>
            <h3 className="text-xl font-bold text-gray-800 leading-tight">{campaign.name}</h3>
            <p className="text-sm text-gray-500 font-medium">por {campaign.entrepreneurName}</p>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white/60 p-3 rounded-xl mb-4 backdrop-blur-sm">
        <p className="text-lg font-bold text-gray-800 text-center">{configText}</p>
        <p className="text-xs text-center text-gray-500 mt-1">
            Válido hasta: {new Date(campaign.endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Productos incluidos */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Productos participantes:</p>
        <div className="flex flex-wrap gap-1">
            {campaign.items && campaign.items.length > 0 ? (
                campaign.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">
                        {item}
                    </span>
                ))
            ) : <span className="text-xs text-gray-400 italic">Sin productos asignados</span>}
            {campaign.items && campaign.items.length > 3 && (
                <span className="text-xs text-gray-400 self-center">+{campaign.items.length - 3} más</span>
            )}
        </div>
      </div>

      {/* Controles de Edición */}
      {canEdit && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Gestión</span>
            {campaign.status === 'active' ? (
                <button 
                    onClick={() => onUpdateStatus(campaign.id, 'paused')}
                    className="px-4 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-lg hover:bg-yellow-200 transition"
                >
                    ⏸ Pausar
                </button>
            ) : (
                <button 
                    onClick={() => onUpdateStatus(campaign.id, 'active')}
                    className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition"
                >
                    ▶ Activar
                </button>
            )}
        </div>
      )}
    </div>
  );
};

export default CampaignCard;