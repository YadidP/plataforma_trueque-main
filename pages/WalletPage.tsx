import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { Wallet, CreditMovement, CreditPackage, SubscriptionPlan } from '../types';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';

const WalletPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [movements, setMovements] = useState<CreditMovement[]>([]); // Solo los recientes
  const [allMovements, setAllMovements] = useState<CreditMovement[]>([]); // Todos para el modal
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSub, setActiveSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; type: 'credits' | 'plan'; item: any; } | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [activeTab, setActiveTab] = useState<'credits' | 'plans'>('credits');

  const fetchData = async () => {
    if (user) {
      setLoading(true);
      try {
        const [walletData, movementsData, packagesData, plansData, subData] = await Promise.all([
          api.getWallet(),
          api.getCreditMovements(), // Trae los recientes por defecto
          api.getCreditPackages(),
          api.getSubscriptionPlans(),
          api.getMySubscription()
        ]);
        setWallet(walletData);
        setMovements(movementsData.slice(0, 5)); // Solo mostrar 5 en la vista previa
        setAllMovements(movementsData); // Guardar todos para el modal
        setPackages(packagesData);
        setPlans(plansData);
        setActiveSub(subData);
      } catch (error) {
        console.error("Error al cargar datos", error);
      } finally {
        setLoading(false);
      }
    }
  }

  useEffect(() => { fetchData(); }, []);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    setProcessing(true);
    try {
      if (confirmModal.type === 'credits') {
        await api.purchaseCredits(confirmModal.item.id, `REF-${Date.now()}`);
        addNotification('¡Créditos añadidos exitosamente!', 'success');
      } else {
        await api.subscribeToPlan(confirmModal.item.id);
        addNotification(`¡Bienvenido al ${confirmModal.item.name}!`, 'success');
      }
      await fetchData();
      setConfirmModal(null);
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Error en la transacción', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4">
      {/* Card de Saldo Principal */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-3xl p-8 text-white shadow-2xl mb-10 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-green-100 text-sm uppercase tracking-widest font-bold mb-2">Billetera Digital</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-extrabold">{wallet?.balance || 0}</span>
            <span className="text-2xl font-medium text-green-100">créditos</span>
          </div>
          {activeSub && (
            <div className="mt-4 inline-flex items-center bg-yellow-400/20 backdrop-blur-md border border-yellow-400/50 rounded-full px-4 py-1">
              <span className="text-yellow-300 mr-2">★</span>
              <span className="text-sm font-semibold text-yellow-100">{activeSub.name} Activo</span>
            </div>
          )}
        </div>
        
        {/* Botón Historial Diferenciado */}
        <div className="mt-6 md:mt-0 relative z-10">
            <button 
                onClick={() => setHistoryModalOpen(true)}
                className="flex items-center gap-2 bg-white text-green-800 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition shadow-lg"
            >
                <span>📜</span> Ver Historial Completo
            </button>
        </div>

        {/* Decoración Fondo */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
            <svg width="300" height="300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.13 2.88-2.87 3.16z"/></svg>
        </div>
      </div>

      {/* Tabs Superiores */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex">
            <button
                onClick={() => setActiveTab('credits')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'credits' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Recargar Saldo
            </button>
            <button
                onClick={() => setActiveTab('plans')}
                className={`px-8 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'plans' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Planes Premium
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Principal (Izquierda) */}
        <div className="lg:col-span-2">
            {activeTab === 'credits' ? (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Paquetes de Créditos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {packages.map(pkg => (
                            <div key={pkg.id} className="bg-white border border-gray-100 p-6 rounded-2xl hover:shadow-lg transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-green-100 text-green-600 p-3 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        💰
                                    </div>
                                    <span className="text-2xl font-bold text-gray-800">{pkg.priceBs} Bs</span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-700">{pkg.credits} Créditos</h4>
                                <p className="text-sm text-gray-500 mb-6">Ideal para intercambios pequeños.</p>
                                <button 
                                    onClick={() => setConfirmModal({ isOpen: true, type: 'credits', item: pkg })}
                                    className="w-full py-3 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-green-600 hover:text-white transition-all"
                                >
                                    Adquirir
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Suscripciones Mensuales</h3>
                    <div className="space-y-4">
                        {plans.map(plan => {
                            const isCurrent = activeSub?.id === plan.id;
                            return (
                                <div key={plan.id} className={`relative p-6 rounded-2xl border-2 transition-all ${isCurrent ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white hover:border-yellow-400 hover:shadow-md'}`}>
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-6 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            PLAN ACTUAL
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                {plan.name}
                                                {!isCurrent && <span className="text-yellow-500 text-sm">💎</span>}
                                            </h4>
                                            <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                                        </div>
                                        <div className="text-right min-w-[120px]">
                                            <div className="text-2xl font-bold text-gray-900">{plan.price_bs} Bs</div>
                                            <div className="text-xs text-gray-500 mb-3">mensuales</div>
                                            
                                            {isCurrent ? (
                                                <button disabled className="w-full py-2 px-4 bg-green-200 text-green-800 rounded-lg font-bold text-sm cursor-default">
                                                    Activo
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => setConfirmModal({ isOpen: true, type: 'plan', item: plan })}
                                                    className="w-full py-2 px-4 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                                                >
                                                    Suscribirse
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Columna Derecha: Resumen Rápido */}
        <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <span>⏱️</span> Últimos Movimientos
                </h3>
                {movements.length > 0 ? (
                    <ul className="space-y-3">
                        {movements.map(m => (
                            <li key={m.id} className="flex justify-between items-center text-sm pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium text-gray-800 capitalize">{m.description.replace(/_/g, ' ')}</div>
                                    <div className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString()}</div>
                                </div>
                                <span className={`font-bold ${m.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {m.delta > 0 ? '+' : ''}{m.delta}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm text-center py-4">Sin movimientos recientes</p>
                )}
            </div>
        </div>
      </div>

      {/* MODAL DE HISTORIAL COMPLETO */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-800">Historial de Transacciones</h3>
                    <button onClick={() => setHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div className="overflow-y-auto p-0 flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Detalle</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Monto</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allMovements.map((m, i) => (
                                <tr key={m.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                    <td className="p-4 text-sm text-gray-600">{new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                    <td className="p-4 text-sm font-medium text-gray-800 capitalize">{m.description.replace(/_/g, ' ')}</td>
                                    <td className={`p-4 text-sm font-bold text-right ${m.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {m.delta > 0 ? '+' : ''}{m.delta}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 text-right">{m.balanceAfter}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {allMovements.length === 0 && <div className="p-10 text-center text-gray-400">No hay historial disponible.</div>}
                </div>
                <div className="p-4 border-t border-gray-100 text-right">
                    <button onClick={() => setHistoryModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300">Cerrar</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
                        {confirmModal.type === 'credits' ? '💳' : '⭐'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Pago</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        {confirmModal.type === 'credits' 
                            ? `Estás comprando ${confirmModal.item.credits} créditos.`
                            : `Te estás suscribiendo al ${confirmModal.item.name}.`}
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
                        <div className="text-xs text-gray-500 uppercase font-bold">Total a Pagar</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {confirmModal.type === 'credits' ? confirmModal.item.priceBs : confirmModal.item.price_bs} Bs
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setConfirmModal(null)}
                            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleConfirmAction}
                            disabled={processing}
                            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 text-sm shadow-lg shadow-green-200 disabled:bg-gray-400 disabled:shadow-none"
                        >
                            {processing ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
