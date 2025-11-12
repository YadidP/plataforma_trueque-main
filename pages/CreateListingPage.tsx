import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { Category, Subcategory, Material, ImpactMetricResult } from '../types';

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CreateListingPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [unitCredits, setUnitCredits] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [impactPreview, setImpactPreview] = useState<ImpactMetricResult[] | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Debounce quantity and unitLabel for impact preview
  const debouncedQuantity = useDebounce(quantity, 500);
  const debouncedUnitLabel = useDebounce(unitLabel, 500);

  // Fetch Categories on mount
  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  // Fetch Subcategories when Category changes
  useEffect(() => {
    if (categoryId) {
      api.getSubcategoriesByCategoryId(Number(categoryId)).then(setSubcategories);
      setSelectedSubcategoryId(''); // Reset subcategory when category changes
      setSelectedMaterialId(''); // Reset material when category changes
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  // Fetch Materials (assuming a general endpoint for now)
  useEffect(() => {
    api.getMaterials().then(setMaterials);
  }, []);

  // Calculate Impact Preview
  useEffect(() => {
    const calculateImpact = async () => {
      if (selectedMaterialId && debouncedQuantity && debouncedUnitLabel) {
        setImpactLoading(true);
        try {
          const result = await api.postImpactPreview({
            material_id: Number(selectedMaterialId),
            quantity: Number(debouncedQuantity),
            quantity_unit: debouncedUnitLabel,
          });
          setImpactPreview(result);
        } catch (error) {
          console.error('Error calculating impact preview:', error);
          setImpactPreview(null);
        } finally {
          setImpactLoading(false);
        }
      } else {
        setImpactPreview(null);
      }
    };
    calculateImpact();
  }, [selectedMaterialId, debouncedQuantity, debouncedUnitLabel]);

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
    if (!categoryId || !selectedSubcategoryId || !selectedMaterialId || !quantity || !unitLabel) {
        addNotification('Por favor, completa todos los campos de categoría, subcategoría, material, cantidad y unidad.', 'error');
        return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('subcategoryId', selectedSubcategoryId); // New field
    formData.append('materialId', selectedMaterialId); // New field
    formData.append('unitCredits', unitCredits);
    formData.append('quantity', quantity); // New field
    formData.append('unitLabel', unitLabel); // Updated field
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
            <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700">Subcategoría</label>
            <select id="subcategoryId" value={selectedSubcategoryId} onChange={(e) => setSelectedSubcategoryId(e.target.value)} required disabled={!categoryId} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary">
              <option value="" disabled>Selecciona una subcategoría</option>
              {subcategories.map(subcat => (
                <option key={subcat.id} value={subcat.id}>{subcat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="materialId" className="block text-sm font-medium text-gray-700">Material</label>
            <select id="materialId" value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary">
              <option value="" disabled>Selecciona un material</option>
              {materials.map(mat => (
                <option key={mat.id} value={mat.id}>{mat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="unitCredits" className="block text-sm font-medium text-gray-700">Valor en Créditos</label>
            <input type="number" id="unitCredits" value={unitCredits} onChange={(e) => setUnitCredits(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary" />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary" />
          </div>
          <div>
            <label htmlFor="unitLabel" className="block text-sm font-medium text-gray-700">Unidad (ej. "kg", "litros", "unidades")</label>
            <input type="text" id="unitLabel" value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary" />
          </div>
        </div>

        {impactLoading && <p className="text-green-dark">Calculando impacto...</p>}
        {impactPreview && impactPreview.length > 0 && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-dark font-semibold">
              🌿 Estás evitando{' '}
              {impactPreview.map((metric, index) => (
                <React.Fragment key={metric.code}>
                  {metric.value} {metric.unit} de {metric.code}
                  {index < impactPreview.length - 1 ? ' y ' : ''}
                </React.Fragment>
              ))}
              .
            </p>
          </div>
        )}

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