import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Listing } from '../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCampaignModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'discount' | 'gift'>('discount');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  
  // Valores de configuración
  const [discountPercent, setDiscountPercent] = useState(10);
  const [minAmount, setMinAmount] = useState(500);
  
  // Selección de items
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // IDs para descuento
  const [rewardItem, setRewardItem] = useState<number | null>(null); // ID para regalo
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar inventario del emprendedor
    api.getMyListings().then(setMyListings).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const config = type === 'discount' 
        ? { discount_percent: Number(discountPercent) }
        : { min_amount: Number(minAmount) };

    const payload = {
        name,
        type,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        config,
        itemIds: type === 'discount' ? selectedItems : undefined,
        rewardId: type === 'gift' ? rewardItem : undefined
    };

    try {
        await api.createCampaign(payload);
        onSuccess();
    } catch (error) {
        alert('Error creando campaña');
    } finally {
        setLoading(false);
    }
  };

  const toggleItem = (id: number) => {
    if (selectedItems.includes(id)) {
        setSelectedItems(prev => prev.filter(i => i !== id));
    } else {
        setSelectedItems(prev => [...prev, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 className="text-xl font-bold text-gray-800">🚀 Crear Nueva Campaña</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* 1. Tipo de Campaña */}
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => setType('discount')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${type === 'discount' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}`}
                >
                    <div className="text-3xl mb-2">🏷️</div>
                    <div className="font-bold text-gray-800">Descuento</div>
                    <div className="text-xs text-gray-500">Baja precios a productos seleccionados</div>
                </div>
                <div 
                    onClick={() => setType('gift')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${type === 'gift' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                >
                    <div className="text-3xl mb-2">🎁</div>
                    <div className="font-bold text-gray-800">Regalo</div>
                    <div className="text-xs text-gray-500">Regala un producto por compras grandes</div>
                </div>
            </div>

            {/* 2. Configuración General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Campaña</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="Ej. Ofertas de Verano" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha Fin</label>
                    <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border p-2 rounded-lg" />
                </div>
            </div>

            {/* 3. Configuración Específica */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                {type === 'discount' ? (
                    <div>
                        <label className="block text-sm font-bold text-red-700 mb-2">Porcentaje de Descuento (%)</label>
                        <input 
                            type="number" min="1" max="99" required 
                            value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))}
                            className="w-full border p-2 rounded-lg text-2xl font-bold text-red-600 text-center"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-bold text-blue-700 mb-2">Monto Mínimo de Compra (Créditos)</label>
                        <input 
                            type="number" min="1" required 
                            value={minAmount} onChange={e => setMinAmount(Number(e.target.value))}
                            className="w-full border p-2 rounded-lg text-2xl font-bold text-blue-600 text-center"
                        />
                    </div>
                )}
            </div>

            {/* 4. Selección de Inventario */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    {type === 'discount' ? 'Selecciona productos para aplicar descuento:' : 'Selecciona el producto que regalarás:'}
                </label>
                <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-2">
                    {myListings.length > 0 ? myListings.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer" onClick={() => type === 'discount' ? toggleItem(item.id) : setRewardItem(item.id)}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                                (type === 'discount' ? selectedItems.includes(item.id) : rewardItem === item.id) 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300'
                            }`}>
                                ✓
                            </div>
                            <img src={item.imageUrl} className="w-10 h-10 object-cover rounded bg-gray-100" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.quantity} en stock - {item.unitCredits} créditos</p>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-400 py-4">No tienes productos activos.</p>}
                </div>
            </div>

        </form>

        <div className="p-4 border-t border-gray-100 flex gap-3 justify-end">
            <button onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
                {loading ? 'Creando...' : 'Publicar Campaña'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignModal;