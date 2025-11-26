import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";
import { useNotification } from "../hooks/useNotification";
import { Category, Subcategory, Material, ImpactMetricResult } from "../types";
import SearchableSelect from "./SearchableSelect";
import { getSubcategoryConfig } from "../utils/subcategoryConfig";

const CreateListingForm: React.FC = () => {
  const [step, setStep] = useState(1);
  
  // Datos
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [unitCredits, setUnitCredits] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  
  // Imágenes
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Listas y Estados
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [impactPreview, setImpactPreview] = useState<ImpactMetricResult[] | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // Cálculo de impacto en tiempo real
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | File[]) => {
    const files = Array.isArray(e) ? e : (e.target.files ? Array.from(e.target.files) : []);
    
    if (files.length > 0) {
      const max = 10 - imageFiles.length;
      const newFiles = files.slice(0, max);
      
      if (newFiles.length === 0 && files.length > 0) {
        addNotification("Límite de 10 imágenes alcanzado", "error");
        return;
      }

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
    if (s === 1) {
      if (!title.trim() || !description.trim() || !categoryId || !selectedSubcategoryId) {
        addNotification("Por favor completa todos los campos", "error");
        return false;
      }
    } else if (s === 2) {
      const cfg = getSubcategoryConfig(selectedSubcategoryName);
      if ((cfg?.requiresMaterial && !selectedMaterialId) || !unitCredits || !quantity) {
        addNotification("Faltan datos de especificaciones", "error");
        return false;
      }
    } else if (s === 3) {
      if (imageFiles.length === 0) {
        addNotification("Debes subir al menos una imagen", "error");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(3)) return;
    
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
      addNotification("¡Publicación creada exitosamente!", "success");
      navigate("/dashboard");
    } catch (err) {
      addNotification("Error al crear la publicación", "error");
    } finally {
      setLoading(false);
    }
  };

  const cfg = getSubcategoryConfig(selectedSubcategoryName);
  const showMat = cfg?.requiresMaterial || false;

  // Dropzone Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFileChange(files);
  };

  return (
    <div className="max-w-3xl mx-auto my-8">
      {/* Header de Pasos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h1 className="text-3xl font-extrabold text-green-900 mb-6 text-center">Vender Artículo</h1>
        <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-10"></div>
            {[1, 2, 3].map(s => (
                <div key={s} className={`flex flex-col items-center gap-2 bg-white px-2 cursor-pointer`} onClick={() => s < step && setStep(s)}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s <= step ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-500'}`}>
                        {s}
                    </div>
                    <span className={`text-xs font-semibold ${s <= step ? 'text-green-800' : 'text-gray-400'}`}>
                        {s === 1 ? 'Detalles' : s === 2 ? 'Datos' : 'Fotos'}
                    </span>
                </div>
            ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        {/* PASO 1: DETALLES BÁSICOS */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">¿Qué vas a intercambiar?</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Bicicleta de montaña, Libros de historia..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción detallada</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Estado, color, tamaño, tiempo de uso..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SearchableSelect
                id="cat"
                label="Categoría"
                value={categoryId}
                onChange={setCategoryId}
                options={categories}
                required
                placeholder="Selecciona..."
              />
              <SearchableSelect
                id="subcat"
                label="Subcategoría"
                value={selectedSubcategoryId}
                onChange={(v) => {
                  setSelectedSubcategoryId(v);
                  const s = subcategories.find(x => x.id.toString() === v);
                  if (s) setSelectedSubcategoryName(s.name);
                }}
                options={subcategories}
                disabled={!categoryId}
                required
                placeholder="Selecciona..."
              />
            </div>
            <button
              type="button"
              onClick={() => validate(1) && setStep(2)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md mt-4"
            >
              Siguiente Paso
            </button>
          </div>
        )}

        {/* PASO 2: ESPECIFICACIONES E IMPACTO */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            {showMat && (
              <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <label className="block text-sm font-bold text-blue-900 mb-2">Material Principal</label>
                <SearchableSelect
                  id="mat"
                  label=""
                  value={selectedMaterialId}
                  onChange={setSelectedMaterialId}
                  options={materials}
                  required
                  placeholder="Ej. Madera, Algodón, Metal..."
                />
                <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  ℹ️ Necesario para calcular la huella de carbono evitada.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cantidad</label>
                <div className="relative">
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full pl-4 pr-16 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none"
                        placeholder="1"
                    />
                    <span className="absolute right-4 top-3 text-gray-400 text-sm font-medium">{unitLabel || 'u.'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Valor (Créditos)</label>
                <div className="relative">
                    <input
                        type="number"
                        min="1"
                        value={unitCredits}
                        onChange={(e) => setUnitCredits(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none"
                        placeholder="Ej: 50"
                    />
                    <span className="absolute right-4 top-3 text-green-600 font-bold">✦</span>
                </div>
              </div>
            </div>

            {/* Preview Impacto */}
            {impactLoading && <div className="text-center text-green-600 py-4">Calculando impacto ambiental...</div>}
            
            {impactPreview && impactPreview.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                  <span>🌍</span> Impacto Estimado
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {impactPreview.map(m => (
                    <div key={m.code} className="relative bg-white/80 p-2 rounded-lg flex justify-between items-center text-sm">
                      <span className="text-gray-600">{m.name}</span>
                      <span className="font-bold text-green-700">{m.value} {m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-50">
                Atrás
              </button>
              <button type="button" onClick={() => validate(2) && setStep(3)} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-md">
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: IMÁGENES (MEJORADO) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-green-400'}`}
            >
                <div className="text-4xl mb-4">📸</div>
                <h3 className="font-bold text-gray-700 mb-2">Sube fotos de tu artículo</h3>
                <p className="text-sm text-gray-500 mb-6">Arrastra y suelta aquí o haz clic para buscar</p>
                
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    id="file-upload"
                    className="hidden"
                />
                <label 
                    htmlFor="file-upload" 
                    className="inline-block bg-white border border-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg cursor-pointer hover:bg-gray-50 transition shadow-sm"
                >
                    Seleccionar Archivos
                </label>
                <p className="text-xs text-gray-400 mt-4">{imageFiles.length}/10 imágenes seleccionadas</p>
            </div>

            {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {imagePreviews.map((p, i) => (
                        <div key={i} className="relative aspect-square group">
                            <img src={p} alt="preview" className="w-full h-full object-cover rounded-xl shadow-sm border border-gray-100" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <button 
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Resumen</h4>
                <p className="text-sm text-gray-600"><span className="font-semibold">Título:</span> {title}</p>
                <p className="text-sm text-gray-600"><span className="font-semibold">Valor:</span> {unitCredits} créditos</p>
            </div>

            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-50">
                Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:bg-gray-400 disabled:shadow-none transition-all"
              >
                {loading ? "Publicando..." : "¡Publicar Ahora!"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateListingForm;