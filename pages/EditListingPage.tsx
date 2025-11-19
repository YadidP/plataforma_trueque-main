import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../services/api";
import { useNotification } from "../hooks/useNotification";
import { Category, Subcategory, Material, Listing } from "../types";
import SearchableSelect from "../components/SearchableSelect";
import Spinner from "../components/Spinner";

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Estados de carga
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Datos del formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [unitCredits, setUnitCredits] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  
  // Manejo de imágenes
  const [existingImages, setExistingImages] = useState<{id: number, imageUrl: string}[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Listas de opciones
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catsData, matsData, listingData] = await Promise.all([
          api.getCategories(),
          api.getMaterials(),
          api.getListingById(Number(id))
        ]);

        setCategories(catsData);
        setMaterials(matsData);
        
        // Rellenar formulario
        setTitle(listingData.title);
        setDescription(listingData.description);
        setCategoryId(listingData.categoryId.toString());
        setUnitCredits(listingData.unitCredits.toString());
        setQuantity(listingData.quantity?.toString() || "");
        setUnitLabel(listingData.unitLabel || "");
        
        // Cargar subcategorías basadas en la categoría
        const subs = await api.getSubcategoriesByCategoryId(listingData.categoryId);
        setSubcategories(subs);
        setSubcategoryId(listingData.subcategoryId?.toString() || "");
        setMaterialId(listingData.materialId?.toString() || "");

        // Cargar imágenes existentes
        if (listingData.images) {
            setExistingImages(listingData.images.map(img => ({
                id: img.id,
                imageUrl: img.imageUrl // La API ya devuelve la URL completa gracias al getter
            })));
        }

      } catch (error) {
        console.error(error);
        addNotification("Error al cargar la publicación", "error");
        navigate("/dashboard");
      } finally {
        setLoadingData(false);
      }
    };
    if (id) loadData();
  }, [id, navigate, addNotification]);

  // Manejar cambio de categoría (limpia subcategoría)
  useEffect(() => {
    if (categoryId && !loadingData) {
      api.getSubcategoriesByCategoryId(Number(categoryId)).then(setSubcategories);
    }
  }, [categoryId, loadingData]);

  // Manejo de nuevas imágenes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + newImageFiles.length + files.length;
      
      if (totalImages > 10) {
        addNotification("Máximo 10 imágenes permitidas", "error");
        return;
      }

      setNewImageFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("title", title);
    data.append("description", description);
    data.append("categoryId", categoryId);
    data.append("subcategoryId", subcategoryId);
    if (materialId) data.append("materialId", materialId);
    data.append("quantity", quantity);
    data.append("unitLabel", unitLabel);
    data.append("unitCredits", unitCredits);

    // Enviar lista de URLs que se mantienen (como JSON string)
    const keptUrls = existingImages.map(img => img.imageUrl);
    data.append("keptImageUrls", JSON.stringify(keptUrls));

    // Enviar nuevas imágenes
    newImageFiles.forEach(f => data.append("imageFiles", f));

    try {
      await api.updateListing(Number(id), data);
      addNotification("Publicación actualizada correctamente", "success");
      navigate(`/listings/${id}`);
    } catch (error) {
      console.error(error);
      addNotification("Error al actualizar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg my-8">
      <h1 className="text-3xl font-bold text-green-dark mb-6">Editar Publicación</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Básicos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            id="cat"
            label="Categoría"
            value={categoryId}
            onChange={setCategoryId}
            options={categories}
            required
          />
          <SearchableSelect
            id="subcat"
            label="Subcategoría"
            value={subcategoryId}
            onChange={setSubcategoryId}
            options={subcategories}
            required
          />
        </div>

        {materials.length > 0 && (
           <SearchableSelect
             id="mat"
             label="Material (Opcional)"
             value={materialId}
             onChange={setMaterialId}
             options={materials}
           />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Unidad</label>
                <input type="text" value={unitLabel} disabled className="w-full border p-2 rounded bg-gray-100" />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Créditos</label>
                <input type="number" value={unitCredits} onChange={e => setUnitCredits(e.target.value)} className="w-full border p-2 rounded" required />
            </div>
        </div>

        {/* Gestión de Imágenes */}
        <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Imágenes</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Imágenes Existentes */}
                {existingImages.map((img, idx) => (
                    <div key={`old-${idx}`} className="relative group">
                        <img src={img.imageUrl} alt="existente" className="w-full h-24 object-cover rounded border-2 border-blue-200" />
                        <button
                            type="button"
                            onClick={() => removeExistingImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            &times;
                        </button>
                        <span className="absolute bottom-0 left-0 bg-blue-500 text-white text-xs px-1">Guardada</span>
                    </div>
                ))}

                {/* Imágenes Nuevas */}
                {newImagePreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative group">
                        <img src={src} alt="nueva" className="w-full h-24 object-cover rounded border-2 border-green-200" />
                        <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            &times;
                        </button>
                        <span className="absolute bottom-0 left-0 bg-green-500 text-white text-xs px-1">Nueva</span>
                    </div>
                ))}
            </div>

            {(existingImages.length + newImageFiles.length) < 10 && (
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
            )}
        </div>

        <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 border py-2 rounded text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-green-primary text-white py-2 rounded hover:bg-green-dark disabled:opacity-50">
                {submitting ? "Guardando..." : "Guardar Cambios"}
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditListingPage;
