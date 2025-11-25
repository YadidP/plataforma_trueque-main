import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { Listing, Category } from '../types';
import ListingCard from '../components/ListingCard';
import Spinner from '../components/Spinner';

const ListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minCredits: '',
    maxCredits: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [listingsData, categoriesData] = await Promise.all([
          api.getListings(),
          api.getCategories(),
        ]);
        setListings(listingsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Lógica de filtrado corregida
  const filteredListings = listings.filter(listing => {
    // 1. Búsqueda
    const searchMatch = listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                        listing.description.toLowerCase().includes(filters.search.toLowerCase());
    
    // 2. Categoría (parseInt es clave aquí porque el value del select es string)
    const categoryMatch = filters.category === '' || listing.categoryId === parseInt(filters.category);
    
    // 3. Créditos
    const min = filters.minCredits === '' ? 0 : parseInt(filters.minCredits);
    const max = filters.maxCredits === '' ? Infinity : parseInt(filters.maxCredits);
    const creditsMatch = listing.unitCredits >= min && listing.unitCredits <= max;

    return searchMatch && categoryMatch && creditsMatch;
  });

  return (
    <div className="min-h-screen pb-12 bg-gray-50">
      {/* Header y Buscador */}
      <div className="bg-white border-b border-gray-200 pt-8 pb-6 px-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-green-900 mb-6">Explorar Mercado</h1>
            
            {/* Barra de Filtros Horizontal */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Buscador Principal */}
                <div className="relative flex-grow w-full lg:w-auto">
                    <input 
                        type="text"
                        placeholder="¿Qué buscas hoy?"
                        value={filters.search}
                        onChange={e => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>

                {/* Selector Categoría */}
                <div className="w-full lg:w-48">
                    <select 
                        value={filters.category}
                        onChange={e => handleFilterChange('category', e.target.value)}
                        className="w-full py-3 px-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                    >
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Rango de Créditos */}
                <div className="flex gap-2 w-full lg:w-auto">
                    <input 
                        type="number" 
                        placeholder="Mín" 
                        value={filters.minCredits}
                        onChange={e => handleFilterChange('minCredits', e.target.value)}
                        className="w-24 py-3 px-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none shadow-sm text-center"
                    />
                    <span className="self-center text-gray-400">-</span>
                    <input 
                        type="number" 
                        placeholder="Máx" 
                        value={filters.maxCredits}
                        onChange={e => handleFilterChange('maxCredits', e.target.value)}
                        className="w-24 py-3 px-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none shadow-sm text-center"
                    />
                </div>

                {/* Botón Limpiar */}
                {(filters.search || filters.category || filters.minCredits || filters.maxCredits) && (
                    <button 
                        onClick={() => setFilters({ search: '', category: '', minCredits: '', maxCredits: '' })}
                        className="text-sm text-red-500 font-medium hover:bg-red-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                        Limpiar Filtros
                    </button>
                )}
            </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500 font-medium">
                {filteredListings.length} {filteredListings.length === 1 ? 'resultado' : 'resultados'}
            </p>
        </div>

        {loading ? <Spinner /> : (
            filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredListings.map(listing => (
                        <div key={listing.id} className="relative transition-transform hover:-translate-y-1 duration-200">
                            {/* Badge Premium */}
                            {listing.author?.isPremium && (
                                <div className="absolute -top-3 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <span>⭐</span> DESTACADO
                                </div>
                            )}
                            <ListingCard listing={listing} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <span className="text-4xl">😕</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No encontramos lo que buscas</h3>
                    <p className="text-gray-500 mt-2">Intenta cambiar los filtros o buscar con otras palabras.</p>
                    <button 
                        onClick={() => setFilters({ search: '', category: '', minCredits: '', maxCredits: '' })}
                        className="mt-6 text-green-600 font-bold hover:underline"
                    >
                        Ver todas las publicaciones
                    </button>
                </div>
            )
        )}
      </div>
    </div>
  );
};

export default ListingsPage;