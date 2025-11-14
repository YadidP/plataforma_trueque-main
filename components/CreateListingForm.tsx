import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useNotification } from '../hooks/useNotification';
import { Category, Subcategory, Material, ImpactMetricResult } from '../types';
import SearchableSelect from './SearchableSelect';
import { getQuantityRanges } from '../utils/quantityRanges';

interface CreateListingFormProps {}

const CreateListingForm: React.FC<CreateListingFormProps> = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [unitCredits, setUnitCredits] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quantityRange, setQuantityRange] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quantityRangeOptions, setQuantityRangeOptions] = useState<{ label: string; range: string }[]>([]);

  const [impactPreview, setImpactPreview] = useState<ImpactMetricResult[] | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Fetch Categories on mount
  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getMaterials().then(setMaterials);
  }, []);

  // Fetch Subcategories when Category changes
  useEffect(() => {
    if (categoryId) {
      api.getSubcategoriesByCategoryId(Number(categoryId)).then(setSubcategories);
      setSelectedSubcategoryId('');
      setSelectedMaterialId('');
      setQuantityRange('');
    } else {
      setSubcategories([]);
    }
  }, [categoryId]);

  // Update quantity range options when unit changes
  useEffect(() => {
    if (unitLabel) {
      const ranges = getQuantityRanges(unitLabel);
      setQuantityRangeOptions(
        ranges.map(r => ({
          label: r.max === null ? `Más de ${r.min}` : `${r.min} - ${r.max}`,
          range: r.max === null ? `${r.min}+` : `${r.min}-${r.max}`,
        }))
      );
      setQuantityRange('');
    } else {
      setQuantityRangeOptions([]);
    }
  }, [unitLabel]);

  // Calculate Impact Preview
  useEffect(() => {
    const calculateImpact = async () => {
      if (selectedMaterialId && (quantity || quantityRange) && unitLabel) {
        setImpactLoading(true);
        try {
          const quantityValue = quantity ? Number(quantity) : parseInt(quantityRange.split('-')[0]);
          const result = await api.postImpactPreview({
            material_id: Number(selectedMaterialId),
            quantity: quantityValue,
            quantity_unit: unitLabel,
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
  }, [selectedMaterialId, quantity, quantityRange, unitLabel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (stepNum: number): boolean => {
    const errors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!title.trim()) errors.title = 'El título es requerido';
      if (!description.trim()) errors.description = 'La descripción es requerida';
      if (!categoryId) errors.categoryId = 'La categoría es requerida';
      if (!selectedSubcategoryId) errors.subcategoryId = 'La subcategoría es requerida';
    } else if (stepNum === 2) {
      if (!unitLabel) errors.unitLabel = 'La unidad es requerida';
      if (!unitCredits) errors.unitCredits = 'El valor en créditos es requerido';
      if (!quantity && !quantityRange && selectedMaterialId) {
        errors.quantity = 'Debes especificar una cantidad o rango';
      }
    } else if (stepNum === 3) {
      if (!imageFile) errors.imageFile = 'La imagen es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      addNotification('Por favor, completa todos los campos requeridos', 'error');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('subcategoryId', selectedSubcategoryId);
    if (selectedMaterialId) formData.append('materialId', selectedMaterialId);
    formData.append('unitCredits', unitCredits);
    if (quantity) formData.append('quantity', quantity);
    if (quantityRange) formData.append('quantityRange', quantityRange);
    if (unitLabel) formData.append('unitLabel', unitLabel);
    if (imageFile) formData.append('imageFile', imageFile);

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

      {/* Stepper */}
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`flex-1 ${s < 3 ? 'mr-4' : ''}`}
            onClick={() => s <= step && setStep(s)}
          >
            <div
              className={`flex items-center justify-center h-12 rounded-full font-semibold cursor-pointer transition-colors ${
                s === step
                  ? 'bg-green-primary text-white'
                  : s < step
                  ? 'bg-green-100 text-green-primary'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
            <p className="text-center mt-2 text-sm font-medium">
              {s === 1 ? 'Detalles' : s === 2 ? 'Especificaciones' : 'Imagen'}
            </p>
            {s < 3 && <div className="h-1 bg-gray-200 mt-2 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Detalles básicos y categorización */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-green-dark mb-4">Paso 1: Detalles Básicos</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mesas de madera recicladas"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary ${
                  formErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu producto en detalle..."
                rows={4}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableSelect
                id="categoryId"
                label="Categoría"
                value={categoryId}
                onChange={setCategoryId}
                options={categories}
                required
                placeholder="Selecciona una categoría"
              />
              {formErrors.categoryId && <p className="text-red-500 text-sm">{formErrors.categoryId}</p>}

              <SearchableSelect
                id="subcategoryId"
                label="Subcategoría"
                value={selectedSubcategoryId}
                onChange={setSelectedSubcategoryId}
                options={subcategories}
                disabled={!categoryId}
                required
                placeholder="Selecciona una subcategoría"
              />
              {formErrors.subcategoryId && <p className="text-red-500 text-sm">{formErrors.subcategoryId}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-green-primary hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Especificaciones */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-green-dark mb-4">Paso 2: Especificaciones</h2>

            <SearchableSelect
              id="materialId"
              label="Material (Opcional)"
              value={selectedMaterialId}
              onChange={setSelectedMaterialId}
              options={materials}
              placeholder="Selecciona un material"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="unitLabel" className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad <span className="text-red-500">*</span>
                </label>
                <select
                  id="unitLabel"
                  value={unitLabel}
                  onChange={(e) => setUnitLabel(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary ${
                    formErrors.unitLabel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una unidad</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="litros">Litros</option>
                  <option value="unidades">Unidades</option>
                  <option value="metros">Metros</option>
                  <option value="metros2">Metros cuadrados (m²)</option>
                </select>
                {formErrors.unitLabel && <p className="text-red-500 text-sm mt-1">{formErrors.unitLabel}</p>}
              </div>

              <div>
                <label htmlFor="unitCredits" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor en Créditos <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="unitCredits"
                  value={unitCredits}
                  onChange={(e) => setUnitCredits(e.target.value)}
                  min="1"
                  placeholder="Ej: 100"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary ${
                    formErrors.unitCredits ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.unitCredits && <p className="text-red-500 text-sm mt-1">{formErrors.unitCredits}</p>}
              </div>
            </div>

            {quantityRangeOptions.length > 0 ? (
              <div>
                <label htmlFor="quantityRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Rango de Cantidad (Opcional)
                </label>
                <select
                  id="quantityRange"
                  value={quantityRange}
                  onChange={(e) => setQuantityRange(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary"
                >
                  <option value="">Selecciona un rango</option>
                  {quantityRangeOptions.map(opt => (
                    <option key={opt.range} value={opt.range}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad (Opcional)
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  placeholder="Ej: 5"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-primary focus:border-green-primary"
                />
              </div>
            )}

            {impactLoading && (
              <p className="text-green-dark font-semibold">Calculando impacto ambiental...</p>
            )}
            {impactPreview && impactPreview.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-md">
                <p className="text-green-dark font-semibold">
                  🌿 Estás evitando:
                  {impactPreview.map((metric, index) => (
                    <span key={metric.code}>
                      {' '}
                      {metric.value} {metric.unit} de {metric.code}
                      {index < impactPreview.length - 1 ? ' y' : ''}
                    </span>
                  ))}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 border-2 border-green-primary hover:bg-green-50 text-green-primary font-bold py-2 px-4 rounded transition-colors"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 bg-green-primary hover:bg-green-dark text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Imagen */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-green-dark mb-4">Paso 3: Imagen y Confirmación</h2>

            <div>
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del Artículo <span className="text-red-500">*</span>
              </label>
              
              {imagePreview ? (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-md shadow-md max-h-96 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="mt-2 text-red-500 hover:text-red-700 font-semibold"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  id="imageFile"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-primary hover:file:bg-green-200"
                />
              )}
              {formErrors.imageFile && <p className="text-red-500 text-sm mt-1">{formErrors.imageFile}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-gray-800 mb-3">Resumen de tu publicación:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><strong>Título:</strong> {title}</li>
                <li><strong>Categoría:</strong> {categories.find(c => c.id.toString() === categoryId)?.name}</li>
                <li><strong>Subcategoría:</strong> {subcategories.find(s => s.id.toString() === selectedSubcategoryId)?.name}</li>
                {selectedMaterialId && (
                  <li><strong>Material:</strong> {materials.find(m => m.id.toString() === selectedMaterialId)?.name}</li>
                )}
                <li><strong>Valor:</strong> {unitCredits} créditos</li>
                {(quantity || quantityRange) && (
                  <li><strong>Cantidad:</strong> {quantityRange || quantity} {unitLabel}</li>
                )}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 border-2 border-green-primary hover:bg-green-50 text-green-primary font-bold py-2 px-4 rounded transition-colors"
              >
                Anterior
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-primary hover:bg-green-dark disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        )}
      </form>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default CreateListingForm;
