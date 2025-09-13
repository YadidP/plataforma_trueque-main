import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { Category } from '../types';

const CreateListingPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitCredits, setUnitCredits] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
        addNotification('Por favor, sube una imagen para la publicación.', 'error');
        return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('unitCredits', unitCredits);
    formData.append('unitLabel', 'unidad'); // Opcional: Podría ser un campo en el formulario
    formData.append('imageFile', imageFile);

    try {
      await api.createListing(formData);
      addNotification('¡Publicación creada! Has recibido +5 créditos de incentivo.', 'success');
      navigate('/dashboard');
    } catch (error) {
      addNotification('Error al crear la publicación.', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-green-dark mb-6">Crear Nueva Publicación</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Categoría</label>
            <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary">
              <option value="" disabled>Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unitCredits" className="block text-sm font-medium text-gray-700">Valor en Créditos</label>
            <input type="number" id="unitCredits" value={unitCredits} onChange={(e) => setUnitCredits(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary" />
          </div>
        </div>
        <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">Imagen del Artículo</label>
            <input type="file" id="imageFile" onChange={handleFileChange} required accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-primary hover:file:bg-green-200" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-primary hover:bg-green-dark disabled:bg-gray-400">
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
