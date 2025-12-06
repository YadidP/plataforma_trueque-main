import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

// Componente para gestionar el catálogo dentro de AdminPage
const CatalogManager = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [newCatName, setNewCatName] = useState('');
    const [newMatName, setNewMatName] = useState('');
    const [newSubName, setNewSubName] = useState('');
    const [selectedCatId, setSelectedCatId] = useState('');

    const refreshData = async () => {
        setLoading(true);
        try {
            const [cats, mats] = await Promise.all([api.getCategories(), api.getMaterials()]);
            setCategories(cats);
            setMaterials(mats);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { refreshData(); }, []);

    const handleAddCategory = async () => {
        if (!newCatName.trim()) return;
        try {
            await api.createCategory(newCatName);
            setNewCatName('');
            refreshData();
            alert('Categoría añadida');
        } catch (e) { alert('Error al añadir categoría'); }
    };

    const handleAddMaterial = async () => {
        if (!newMatName.trim()) return;
        try {
            await api.createMaterial(newMatName);
            setNewMatName('');
            refreshData();
            alert('Material añadido');
        } catch (e) { alert('Error al añadir material'); }
    };

    const handleAddSubcategory = async () => {
        if (!newSubName.trim() || !selectedCatId) return;
        try {
            await api.createSubcategory(newSubName, Number(selectedCatId));
            setNewSubName('');
            refreshData();
            alert('Subcategoría añadida');
        } catch (e) { alert('Error al añadir subcategoría'); }
    };

    if (loading && categories.length === 0) return <div className="p-4 text-center">Cargando catálogo...</div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-6 text-center text-lg">Gestión de Catálogo (Publicaciones)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* COLUMNA 1: CATEGORÍAS */}
                <div className="space-y-4">
                    <h4 className="font-bold text-green-700 border-b pb-2">1. Categorías</h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nueva Categoría"
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            value={newCatName}
                            onChange={e => setNewCatName(e.target.value)}
                        />
                        <button onClick={handleAddCategory} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700">+</button>
                    </div>
                    <ul className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2 text-sm space-y-1">
                        {categories.map(c => (
                            <li key={c.id} className="text-gray-600">• {c.name}</li>
                        ))}
                    </ul>
                </div>

                {/* COLUMNA 2: SUBCATEGORÍAS */}
                <div className="space-y-4">
                    <h4 className="font-bold text-blue-700 border-b pb-2">2. Subcategorías</h4>
                    <div className="space-y-2">
                        <select 
                            className="w-full border rounded px-2 py-1 text-sm bg-white"
                            value={selectedCatId}
                            onChange={e => setSelectedCatId(e.target.value)}
                        >
                            <option value="">Selecciona Categoría Padre</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Nueva Subcategoría"
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                value={newSubName}
                                onChange={e => setNewSubName(e.target.value)}
                                disabled={!selectedCatId}
                            />
                            <button onClick={handleAddSubcategory} disabled={!selectedCatId} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700 disabled:bg-gray-300">+</button>
                        </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2 text-sm text-gray-500 italic">
                        Selecciona una categoría para añadir subcategorías.
                    </div>
                </div>

                {/* COLUMNA 3: MATERIALES */}
                <div className="space-y-4">
                    <h4 className="font-bold text-orange-700 border-b pb-2">3. Materiales</h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Nuevo Material"
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            value={newMatName}
                            onChange={e => setNewMatName(e.target.value)}
                        />
                        <button onClick={handleAddMaterial} className="bg-orange-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-orange-700">+</button>
                    </div>
                    <ul className="max-h-40 overflow-y-auto border rounded bg-gray-50 p-2 text-sm space-y-1">
                        {materials.map(m => (
                            <li key={m.id} className="text-gray-600">• {m.name}</li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default CatalogManager;