import React from 'react';
import { ImpactMetrics } from '../types';

interface ImpactMetricsPanelProps {
  metrics: ImpactMetrics | null;
  loading?: boolean;
}

const ImpactMetricsPanel: React.FC<ImpactMetricsPanelProps> = ({ metrics, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">No hay datos de impacto disponibles</p>
      </div>
    );
  }

  const impactCards = [
    {
      title: 'CO₂ Evitado',
      value: (metrics.co2Saved || 0).toFixed(2), // Usamos '|| 0' como valor por defecto
      unit: metrics.co2Unit || 'kg',
      icon: '🌍',
      color: 'blue',
      description: 'Emisiones reducidas',
      equivalence: `Equivalente a una búsqueda en Google ~${Math.round((metrics.co2Saved || 0) / 0.02)}x`
    },
    {
      title: 'Agua Ahorrada',
      value: (metrics.waterSaved || 0).toFixed(2), // Usamos '|| 0' como valor por defecto
      unit: metrics.waterUnit || 'litros',
      icon: '💧',
      color: 'cyan',
      description: 'Litros conservados',
      equivalence: `Equivalente a ${Math.round((metrics.waterSaved || 0) / 100)} duchas`
    },
    {
      title: 'Energía Ahorrada',
      value: (metrics.energySaved || 0).toFixed(2), // Usamos '|| 0' como valor por defecto
      unit: metrics.energyUnit || 'kWh',
      icon: '⚡',
      color: 'yellow',
      description: 'Energía no consumida',
      equivalence: `Equivalente a cargar ${Math.round((metrics.energySaved || 0) / 0.005)} móviles`
    },
    {
      title: 'Residuos Evitados',
      value: (metrics.wastePrevented || 0).toFixed(2), // Usamos '|| 0' como valor por defecto
      unit: metrics.wasteUnit || 'kg',
      icon: '♻️',
      color: 'green',
      description: 'Basura no generada',
      equivalence: `${Math.round((metrics.wastePrevented || 0) * 1000)} gramos de residuo`
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    cyan: 'bg-cyan-50 border-cyan-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    cyan: 'text-cyan-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Impacto Ambiental Total</h2>
        <p className="text-gray-600 mb-6">
          Has realizado {metrics.reusedItems} intercambios y contribuido significativamente al medio ambiente.
        </p>
      </div>

      {/* Métrica Principal - CO2 */}
      <div className={`border-2 p-6 rounded-lg ${colorClasses.blue}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Métrica Principal</p>
            <h3 className="text-3xl font-bold text-blue-700 mt-1">
              {metrics.co2Saved.toFixed(2)} {metrics.co2Unit || 'kg'}
            </h3>
            <p className="text-gray-600 mt-2">{impactCards[0].description}</p>
            <p className="text-sm text-blue-600 mt-2 italic">{impactCards[0].equivalence}</p>
          </div>
          <span className="text-6xl">{impactCards[0].icon}</span>
        </div>
      </div>

      {/* Grid de Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {impactCards.slice(1).map((card, index) => (
          <div
            key={card.title}
            className={`border-2 p-4 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-4xl ${iconColorClasses[card.color as keyof typeof iconColorClasses]}`}>
                {card.icon}
              </span>
              <h3 className="text-sm font-semibold text-gray-700 text-right flex-1 ml-2">{card.title}</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-1">
              {card.value} <span className="text-sm">{card.unit}</span>
            </p>
            <p className="text-xs text-gray-600 mb-2">{card.description}</p>
            <div className="bg-white/50 rounded p-2 mt-2">
              <p className="text-xs text-gray-700 italic">{card.equivalence}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de Impacto */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-green-800 mb-3">🌿 Resumen de Tu Impacto</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span>Has evitado <strong>{(metrics.co2Saved || 0).toFixed(1)} kg</strong> de CO₂</span>
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span>Has ahorrado <strong>{(metrics.waterSaved || 0).toFixed(0)} litros</strong> de agua</span>
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span>Has evitado <strong>{(metrics.energySaved || 0).toFixed(2)} kWh</strong> de energía</span>
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span>Has prevenido <strong>{(metrics.wastePrevented || 0).toFixed(1)} kg</strong> de residuos</span>
          </li>
          <li className="flex items-center text-lg font-semibold mt-3 pt-3 border-t-2 border-green-300">
            <span className="text-green-600 mr-2">⏱️</span>
            <span>{(metrics.serviceHours || 0)} horas de servicio comunitario</span>
          </li>
        </ul>
      </div>

      {/* Consejos de Sostenibilidad */}
      <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Consejo:</strong> Continúa intercambiando artículos para aumentar tu impacto ambiental.
          ¡Cada intercambio cuenta!
        </p>
      </div>
    </div>
  );
};

export default ImpactMetricsPanel;
