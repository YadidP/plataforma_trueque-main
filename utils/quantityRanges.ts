import { QuantityRange } from '../types';

export const QUANTITY_RANGES: Record<string, QuantityRange[]> = {
  kg: [
    { label: 'Menos de 1 kg', min: 0, max: 1 },
    { label: '1 - 5 kg', min: 1, max: 5 },
    { label: '5 - 10 kg', min: 5, max: 10 },
    { label: '10 - 50 kg', min: 10, max: 50 },
    { label: 'Más de 50 kg', min: 50, max: null },
  ],
  litros: [
    { label: 'Menos de 1 litro', min: 0, max: 1 },
    { label: '1 - 5 litros', min: 1, max: 5 },
    { label: '5 - 20 litros', min: 5, max: 20 },
    { label: '20 - 100 litros', min: 20, max: 100 },
    { label: 'Más de 100 litros', min: 100, max: null },
  ],
  unidades: [
    { label: '1 - 5 unidades', min: 1, max: 5 },
    { label: '5 - 10 unidades', min: 5, max: 10 },
    { label: '10 - 50 unidades', min: 10, max: 50 },
    { label: '50 - 100 unidades', min: 50, max: 100 },
    { label: 'Más de 100 unidades', min: 100, max: null },
  ],
  metros: [
    { label: 'Menos de 1 metro', min: 0, max: 1 },
    { label: '1 - 5 metros', min: 1, max: 5 },
    { label: '5 - 10 metros', min: 5, max: 10 },
    { label: '10 - 50 metros', min: 10, max: 50 },
    { label: 'Más de 50 metros', min: 50, max: null },
  ],
  metros2: [
    { label: 'Menos de 1 m²', min: 0, max: 1 },
    { label: '1 - 10 m²', min: 1, max: 10 },
    { label: '10 - 50 m²', min: 10, max: 50 },
    { label: '50 - 100 m²', min: 50, max: 100 },
    { label: 'Más de 100 m²', min: 100, max: null },
  ],
};

export function getQuantityRanges(unit: string): QuantityRange[] {
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '');
  return QUANTITY_RANGES[normalizedUnit] || [];
}

export function formatQuantityRange(min: number, max: number | null): string {
  if (max === null) {
    return `Más de ${min}`;
  }
  return `${min} - ${max}`;
}
