// utils/subcategoryConfig.ts

export interface SubcategoryConfig {
  name: string;
  requiresMaterial: boolean;
  quantityUnit: 'unidades' | 'kg' | 'litros' | 'metros' | 'metros2';
}

export const SUBCATEGORY_CONFIG: Record<string, SubcategoryConfig> = {
  // --- Electrónica (unidades) ---
  'Smartphones': { name: 'Smartphones', requiresMaterial: true, quantityUnit: 'unidades' },
  'Laptops': { name: 'Laptops', requiresMaterial: true, quantityUnit: 'unidades' },
  'Tablets': { name: 'Tablets', requiresMaterial: true, quantityUnit: 'unidades' },
  'Componentes PC': { name: 'Componentes PC', requiresMaterial: true, quantityUnit: 'unidades' },
  
  // --- Ropa (unidades) ---
  'Camisetas': { name: 'Camisetas', requiresMaterial: true, quantityUnit: 'unidades' },
  'Pantalones': { name: 'Pantalones', requiresMaterial: true, quantityUnit: 'unidades' },
  'Abrigos': { name: 'Abrigos', requiresMaterial: true, quantityUnit: 'unidades' },
  'Zapatos': { name: 'Zapatos', requiresMaterial: true, quantityUnit: 'unidades' },
  
  // --- Libros (unidades) ---
  'Novelas': { name: 'Novelas', requiresMaterial: true, quantityUnit: 'unidades' },
  'Libros de Texto': { name: 'Libros de Texto', requiresMaterial: true, quantityUnit: 'unidades' },
  
  // --- Hogar (unidades excepto textiles) ---
  'Muebles': { name: 'Muebles', requiresMaterial: true, quantityUnit: 'kg' }, // OJO: Muebles en kg para calcular madera mejor
  'Decoración': { name: 'Decoración', requiresMaterial: true, quantityUnit: 'unidades' },
  
  // --- Servicios (sin impacto material directo) ---
  'Clases Particulares': { name: 'Clases Particulares', requiresMaterial: false, quantityUnit: 'unidades' },
  'Reparaciones': { name: 'Reparaciones', requiresMaterial: false, quantityUnit: 'unidades' },
};

// Fallback seguro
export function getSubcategoryConfig(subcategoryName: string): SubcategoryConfig {
  return SUBCATEGORY_CONFIG[subcategoryName] || { 
    name: subcategoryName, 
    requiresMaterial: false, 
    quantityUnit: 'unidades' 
  };
}