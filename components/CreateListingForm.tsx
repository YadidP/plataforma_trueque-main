import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { useNotification } from "../hooks/useNotification";
import { Category, Subcategory, Material, ImpactMetricResult } from "../types";
import SearchableSelect from "./SearchableSelect";
import { getSubcategoryConfig } from "../utils/subcategoryConfig";

const CreateListingForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [unitCredits, setUnitCredits] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [impactPreview, setImpactPreview] = useState<ImpactMetricResult[] | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getMaterials().then(setMaterials);
  }, []);

  useEffect(() => {
    if (categoryId) {
      api.getSubcategoriesByCategoryId(Number(categoryId)).then(setSubcategories);
      setSelectedSubcategoryId("");
      setSelectedSubcategoryName("");
      setSelectedMaterialId("");
    }
  }, [categoryId]);

  useEffect(() => {
    if (selectedSubcategoryName) {
      const config = getSubcategoryConfig(selectedSubcategoryName);
      if (config) {
        setUnitLabel(config.quantityUnit);
      }
    }
  }, [selectedSubcategoryName]);

  useEffect(() => {
    const calc = async () => {
      if (selectedMaterialId && quantity && unitLabel) {
        setImpactLoading(true);
        try {
          const qty = Number(quantity);
          const res = await api.postImpactPreview({
            material_id: Number(selectedMaterialId),
            quantity: qty,
            quantity_unit: unitLabel,
          });
          setImpactPreview(res);
        } catch {
          setImpactPreview(null);
        } finally {
          setImpactLoading(false);
        }
      }
    };
    calc();
  }, [selectedMaterialId, quantity, unitLabel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const max = 10 - imageFiles.length;
      const newFiles = files.slice(0, max);
      setImageFiles(prev => [...prev, ...newFiles]);
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (s: number): boolean => {
    const err: Record<string, string> = {};
    if (s === 1) {
      if (!title.trim()) err.title = "Requerido";
      if (!description.trim()) err.description = "Requerido";
      if (!categoryId) err.categoryId = "Requerido";
      if (!selectedSubcategoryId) err.subcategoryId = "Requerido";
    } else if (s === 2) {
      const cfg = getSubcategoryConfig(selectedSubcategoryName);
      if (cfg?.requiresMaterial && !selectedMaterialId) {
        err.materialId = "Requerido";
      }
      if (!unitCredits) err.unitCredits = "Requerido";
    } else if (s === 3) {
      if (imageFiles.length === 0) err.imageFile = "Requiere al menos 1 imagen";
    }
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(3)) {
      addNotification("Complete todos los campos", "error");
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append("title", title);
    data.append("description", description);
    data.append("categoryId", categoryId);
    data.append("subcategoryId", selectedSubcategoryId);
    if (selectedMaterialId) data.append("materialId", selectedMaterialId);
    data.append("quantity", quantity);
    if (unitLabel) data.append("unitLabel", unitLabel);
    data.append("unitCredits", unitCredits);
    imageFiles.forEach(f => data.append("imageFiles", f));
    try {
      await api.createListing(data);
      addNotification("Publicacion creada!", "success");
      navigate("/dashboard");
    } catch (err) {
      addNotification("Error al crear", "error");
    } finally {
      setLoading(false);
    }
  };

  const cfg = getSubcategoryConfig(selectedSubcategoryName);
  const showMat = cfg?.requiresMaterial || false;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-green-dark mb-6">Crear Nueva Publicacion</h1>
      <div className="flex justify-between mb-8">
        {[1, 2, 3].map(s => {
          const stepStyle = `flex-1 ${s < 3 ? "mr-4" : ""}`;
          const btnStyle = s === step ? "bg-green-primary text-white" : s < step ? "bg-green-100 text-green-primary" : "bg-gray-200 text-gray-600";
          const stepLabel = s === 1 ? "Detalles" : s === 2 ? "Especificaciones" : "Imagenes";
          return (
            <div key={s} className={stepStyle}>
              <div
                onClick={() => s <= step && setStep(s)}
                className={`flex items-center justify-center h-12 rounded-full font-semibold cursor-pointer ${btnStyle}`}
              >
                {s}
              </div>
              <p className="text-center mt-2 text-sm font-medium">{stepLabel}</p>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-dark mb-4">Paso 1: Detalles</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mesas de madera"
                className={`w-full px-3 py-2 border rounded-md ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.description ? "border-red-500" : "border-gray-300"}`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                id="cat"
                label="Categoria"
                value={categoryId}
                onChange={setCategoryId}
                options={categories}
                required
                placeholder="Selecciona"
              />
              <SearchableSelect
                id="subcat"
                label="Subcategoria"
                value={selectedSubcategoryId}
                onChange={(v) => {
                  setSelectedSubcategoryId(v);
                  const s = subcategories.find(x => x.id.toString() === v);
                  if (s) setSelectedSubcategoryName(s.name);
                }}
                options={subcategories}
                disabled={!categoryId}
                required
                placeholder="Selecciona"
              />
            </div>
            <button
              type="button"
              onClick={() => validate(1) && setStep(2)}
              className="w-full bg-green-primary text-white py-2 rounded hover:bg-green-dark"
            >
              Siguiente
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-dark mb-4">Paso 2: Especificaciones</h2>
            
            {/* Selector de Material */}
            {showMat && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="block text-sm font-medium text-blue-800 mb-2">¿De qué material está hecho principalmente?</label>
                <SearchableSelect
                  id="mat"
                  label=""
                  value={selectedMaterialId}
                  onChange={setSelectedMaterialId}
                  options={materials}
                  required
                  placeholder="Selecciona el material (ej. Madera, Algodón...)"
                />
                <p className="text-xs text-blue-600 mt-2">ℹ️ Esto define el cálculo de huella ecológica.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Cantidad con Unidad integrada */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Cantidad Disponible</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full pr-12 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 py-2 px-3 border"
                    placeholder="Ej: 5"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {unitLabel || 'u.'} {/* Muestra kg, litros o unidades aquí */}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campo Créditos */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Valor en Créditos (por unidad)</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <input
                    type="number"
                    min="1"
                    value={unitCredits}
                    onChange={(e) => setUnitCredits(e.target.value)}
                    className="block w-full pr-10 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 py-2 px-3 border"
                    placeholder="0"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-green-600 font-bold sm:text-sm">✦</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview del Impacto (Mejorado) */}
            {impactLoading && <p className="text-green-600 text-sm animate-pulse">🌱 Calculando impacto ambiental...</p>}
            
            {impactPreview && impactPreview.length > 0 && (
              <div className="mt-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🌍</span>
                  <h3 className="font-bold text-green-800">Impacto Positivo Estimado</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">Si vendes todo esto, ayudarás al planeta ahorrando:</p>
                <div className="grid grid-cols-2 gap-3">
                  {impactPreview.map(m => (
                    <div key={m.code} className="bg-white/60 p-2 rounded-lg flex justify-between items-center border border-green-100">
                      <span className="text-xs font-medium text-gray-600">{m.name}</span>
                      <span className="text-sm font-bold text-green-700">{m.value} {m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 font-medium"
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={() => validate(2) && setStep(3)}
                className="flex-1 bg-green-primary text-white py-2 rounded-lg hover:bg-green-dark font-medium shadow-md hover:shadow-lg transition-all"
              >
                Continuar a Imágenes
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-green-dark mb-4">Paso 3: Imagenes</h2>
            {imagePreviews.length > 0 ? (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {imagePreviews.map((p, i) => (
                    <div key={i} className="relative">
                      <img
                        src={p}
                        alt={`img${i}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                {imageFiles.length < 10 && (
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                )}
              </div>
            ) : (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            )}
            <p className="text-xs text-gray-500">{imageFiles.length}/10 imagenes</p>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-3">Resumen:</h3>
              <ul className="text-sm space-y-1">
                <li><strong>Titulo:</strong> {title}</li>
                <li><strong>Categoria:</strong> {categories.find(c => c.id.toString() === categoryId)?.name}</li>
                <li><strong>Subcategoria:</strong> {selectedSubcategoryName}</li>
                {showMat && selectedMaterialId && (
                  <li><strong>Material:</strong> {materials.find(m => m.id.toString() === selectedMaterialId)?.name}</li>
                )}
                <li><strong>Creditos:</strong> {unitCredits}</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-green-primary text-green-primary py-2 rounded hover:bg-green-50"
              >
                Anterior
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-primary text-white py-2 rounded hover:bg-green-dark disabled:bg-gray-400"
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateListingForm;
