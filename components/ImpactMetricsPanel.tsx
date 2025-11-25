import React from 'react';
import { ImpactMetrics } from '../types';

interface ImpactMetricsPanelProps {
  metrics: ImpactMetrics | null;
  loading?: boolean;
}

const ImpactMetricsPanel: React.FC<ImpactMetricsPanelProps> = ({ metrics, loading = false }) => {
  // Estado de carga (Skeleton)
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Estado vacío (Usuario sin actividad)
  if (!metrics || metrics.reusedItems === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl border border-green-100 text-center shadow-sm">
        <div className="text-5xl mb-3">🌱</div>
        <h2 className="text-xl font-bold text-green-800 mb-2">Comienza tu impacto positivo</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Aún no tienes métricas registradas. Al completar tu primer intercambio (compra o venta), aquí verás cuánto CO₂ y recursos has ahorrado al planeta.
        </p>
      </div>
    );
  }

  // Helpers para obtener valores seguros
  const getVal = (code: string) => {
    const m = metrics.detailedMetrics.find(x => x.code === code);
    return m ? m.value : 0;
  };

  const co2 = getVal('CO2');
  const water = getVal('WATER');
  const energy = getVal('ENERGY');
  const waste = getVal('WASTE');
  const trees = getVal('TREES');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📊 Tu Impacto Ambiental
          </h2>
          <p className="text-sm text-gray-500 mt-1">Acumulado en tus {metrics.reusedItems} intercambios.</p>
        </div>
      </div>

      {/* Tarjeta Principal: CO2 */}
      <div className="bg-green-primary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-green-100 font-medium mb-1 text-sm uppercase tracking-wide">Huella de Carbono Evitada</div>
          <div className="text-5xl font-bold mb-2">
            {co2.toFixed(1)} <span className="text-2xl font-normal">kg</span>
          </div>
          <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-xs">
             ☁️ Equivalente a cargar {Math.round(co2 / 0.007)} celulares
          </div>
        </div>
        {/* Decoración de fondo */}
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
           <span className="text-9xl">🌍</span>
        </div>
      </div>

      {/* Grid de Métricas Secundarias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="💧" value={water} unit="L" label="Agua Ahorrada" color="text-blue-600 bg-blue-50 border-blue-100" />
        <MetricCard icon="⚡" value={energy} unit="kWh" label="Energía" color="text-yellow-600 bg-yellow-50 border-yellow-100" />
        <MetricCard icon="♻️" value={waste} unit="kg" label="Residuos Evitados" color="text-purple-600 bg-purple-50 border-purple-100" />
        <MetricCard icon="🌳" value={trees} unit="" label="Árboles Eq." color="text-emerald-600 bg-emerald-50 border-emerald-100" />
      </div>
    </div>
  );
};

// Subcomponente simple para las tarjetas pequeñas
const MetricCard = ({ icon, value, unit, label, color }: any) => (
  <div className={`p-4 rounded-xl border ${color} flex flex-col justify-between`}>
    <span className="text-2xl mb-2">{icon}</span>
    <div>
      <div className="text-xl font-bold">
        {value >= 1000 ? (value/1000).toFixed(1) + 'k' : value.toFixed(1)}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </div>
      <div className="text-xs font-semibold uppercase opacity-70">{label}</div>
    </div>
  </div>
);

export default ImpactMetricsPanel;
