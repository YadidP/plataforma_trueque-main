// Configuration for subcategories: which need materials and what quantity ranges to use
export interface SubcategoryConfig {
  name: string;
  requiresMaterial: boolean;
  quantityUnit: 'unidades' | 'kg' | 'litros' | 'metros' | 'metros2';
}

export const SUBCATEGORY_CONFIG: Record<string, SubcategoryConfig> = {
  // Electrónica - unidades (1 a 10 típicamente)
  'Smartphones': { name: 'Smartphones', requiresMaterial: false, quantityUnit: 'unidades' },
  'Laptops': { name: 'Laptops', requiresMaterial: false, quantityUnit: 'unidades' },
  'Tablets': { name: 'Tablets', requiresMaterial: false, quantityUnit: 'unidades' },
  'Componentes PC': { name: 'Componentes PC', requiresMaterial: false, quantityUnit: 'unidades' },
  'Electrodomésticos Pequeños': { name: 'Electrodomésticos Pequeños', requiresMaterial: false, quantityUnit: 'unidades' },

  // Ropa - unidades (1 a 100+)
  'Camisetas': { name: 'Camisetas', requiresMaterial: true, quantityUnit: 'unidades' },
  'Pantalones': { name: 'Pantalones', requiresMaterial: true, quantityUnit: 'unidades' },
  'Abrigos': { name: 'Abrigos', requiresMaterial: true, quantityUnit: 'unidades' },
  'Zapatos': { name: 'Zapatos', requiresMaterial: true, quantityUnit: 'unidades' },
  'Bolsos': { name: 'Bolsos', requiresMaterial: true, quantityUnit: 'unidades' },
  'Joyas': { name: 'Joyas', requiresMaterial: true, quantityUnit: 'unidades' },

  // Libros - unidades
  'Novelas': { name: 'Novelas', requiresMaterial: false, quantityUnit: 'unidades' },
  'Libros de Texto': { name: 'Libros de Texto', requiresMaterial: false, quantityUnit: 'unidades' },
  'Material Escolar': { name: 'Material Escolar', requiresMaterial: false, quantityUnit: 'unidades' },
  'Revistas': { name: 'Revistas', requiresMaterial: false, quantityUnit: 'unidades' },

  // Hogar - unidades o metros2
  'Muebles': { name: 'Muebles', requiresMaterial: true, quantityUnit: 'unidades' },
  'Decoración': { name: 'Decoración', requiresMaterial: false, quantityUnit: 'unidades' },
  'Utensilios de Cocina': { name: 'Utensilios de Cocina', requiresMaterial: true, quantityUnit: 'unidades' },
  'Textiles de Hogar': { name: 'Textiles de Hogar', requiresMaterial: true, quantityUnit: 'metros2' },

  // Deportes - unidades
  'Equipamiento Deportivo': { name: 'Equipamiento Deportivo', requiresMaterial: false, quantityUnit: 'unidades' },
  'Juegos de Mesa': { name: 'Juegos de Mesa', requiresMaterial: false, quantityUnit: 'unidades' },
  'Instrumentos Musicales': { name: 'Instrumentos Musicales', requiresMaterial: false, quantityUnit: 'unidades' },

  // Juguetes - unidades
  'Juguetes Educativos': { name: 'Juguetes Educativos', requiresMaterial: false, quantityUnit: 'unidades' },
  'Ropa de Bebé': { name: 'Ropa de Bebé', requiresMaterial: true, quantityUnit: 'unidades' },
  'Coches de Paseo': { name: 'Coches de Paseo', requiresMaterial: false, quantityUnit: 'unidades' },

  // Herramientas - unidades o kg
  'Herramientas Manuales': { name: 'Herramientas Manuales', requiresMaterial: true, quantityUnit: 'unidades' },
  'Herramientas Eléctricas': { name: 'Herramientas Eléctricas', requiresMaterial: true, quantityUnit: 'unidades' },
  'Materiales de Construcción': { name: 'Materiales de Construcción', requiresMaterial: true, quantityUnit: 'kg' },

  // Salud y Belleza - unidades o ml (approximated as litros)
  'Cuidado Facial': { name: 'Cuidado Facial', requiresMaterial: false, quantityUnit: 'unidades' },
  'Maquillaje': { name: 'Maquillaje', requiresMaterial: false, quantityUnit: 'unidades' },
  'Cuidado del Cabello': { name: 'Cuidado del Cabello', requiresMaterial: false, quantityUnit: 'unidades' },

  // Alimentos - kg o litros
  'Conservas': { name: 'Conservas', requiresMaterial: false, quantityUnit: 'kg' },
  'Granos y Legumbres': { name: 'Granos y Legumbres', requiresMaterial: false, quantityUnit: 'kg' },
  'Bebidas No Alcohólicas': { name: 'Bebidas No Alcohólicas', requiresMaterial: false, quantityUnit: 'litros' },

  // Servicios - no aplica
  'Clases Particulares': { name: 'Clases Particulares', requiresMaterial: false, quantityUnit: 'unidades' },
  'Reparaciones': { name: 'Reparaciones', requiresMaterial: false, quantityUnit: 'unidades' },
  'Diseño Gráfico': { name: 'Diseño Gráfico', requiresMaterial: false, quantityUnit: 'unidades' },
};

export function getSubcategoryConfig(subcategoryName: string): SubcategoryConfig | undefined {
  return SUBCATEGORY_CONFIG[subcategoryName];
}
