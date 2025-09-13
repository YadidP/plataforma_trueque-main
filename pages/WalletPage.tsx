import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as api from '../services/api';
import { Wallet, CreditMovement, CreditPackage } from '../types';
import { useNotification } from '../hooks/useNotification';
import Spinner from '../components/Spinner';

const WalletPage = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [movements, setMovements] = useState<CreditMovement[]>([]);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const fetchWalletData = async () => {
     if (user) {
        setLoading(true);
        try {
          const [walletData, movementsData, packagesData] = await Promise.all([
            api.getWallet(),
            api.getCreditMovements(),
            api.getCreditPackages(),
          ]);
          setWallet(walletData);
          setMovements(movementsData);
          setPackages(packagesData);
        } catch (error) {
          console.error("Error al cargar datos de la billetera:", error);
        } finally {
          setLoading(false);
        }
      }
  }

  useEffect(() => {
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchaseLoading(true);
    try {
        await api.purchaseCredits(pkg.id, `REF-${Date.now()}`);
        addNotification('Compra registrada. Tus créditos han sido acreditados.', 'success');
        await fetchWalletData(); // Refresh wallet data
    } catch(error) {
        addNotification('Error al procesar la compra.', 'error');
    } finally {
        setPurchaseLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-green-dark mb-8">Mi Billetera</h1>
      
      <div className="bg-white p-8 rounded-lg shadow-lg mb-8 text-center">
        <h2 className="text-xl text-gray-600 mb-2">Saldo Actual</h2>
        <p className="text-6xl font-extrabold text-green-primary">{wallet?.balance || 0} créditos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comprar Créditos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Comprar Créditos</h2>
          <div className="space-y-4">
            {packages.map(pkg => (
              <div key={pkg.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-bold text-lg">{pkg.credits} créditos</p>
                  <p className="text-gray-600">{pkg.priceBs} Bs.</p>
                </div>
                <button 
                    onClick={() => handlePurchase(pkg)} 
                    disabled={purchaseLoading}
                    className="bg-green-accent hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-400">
                    Comprar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Historial de Movimientos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Movimientos</h2>
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {movements.map(m => (
              <li key={m.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-100">
                <div>
                  <p className="font-semibold">{m.description}</p>
                  <p className="text-sm text-gray-500">{new Date(m.date).toLocaleString('es-ES')}</p>
                </div>
                <span className={`font-bold text-lg ${m.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {m.delta > 0 ? '+' : ''}{m.delta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
