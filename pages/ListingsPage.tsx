
import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { Listing, Category } from '../types';
import ListingCard from '../components/ListingCard';
import Spinner from '../components/Spinner';

const ListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
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
        console.error("Error al cargar las publicaciones:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredListings = listings.filter(listing => {
    const searchMatch = listing.title.toLowerCase().includes(filters.search.toLowerCase());
    const categoryMatch = filters.category === 'all' || listing.categoryId === parseInt(filters.category);
    const minCreditsMatch = filters.minCredits === '' || listing.unitCredits >= parseInt(filters.minCredits);
    const maxCreditsMatch = filters.maxCredits === '' || listing.unitCredits <= parseInt(filters.maxCredits);
    return searchMatch && categoryMatch && minCreditsMatch && maxCreditsMatch;
  });

  return (
    <div>
      <h1 className="text-4xl font-bold text-green-dark mb-6">Explorar Publicaciones</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <input
          type="text"
          name="search"
          placeholder="Buscar por título..."
          value={filters.search}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <input
          type="number"
          name="minCredits"
          placeholder="Créditos Mín."
          value={filters.minCredits}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          name="maxCredits"
          placeholder="Créditos Máx."
          value={filters.maxCredits}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.length > 0 ? (
            filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No se encontraron publicaciones con esos filtros.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingsPage;
