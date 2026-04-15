import { useMemo, useState } from 'react';
import { createPortal } from "react-dom";
import { useFrasesManager } from '../../Hooks/Frases/useFrasesManager';
import { AppStyles } from '../../Styles/AppStyles';
import { EjerciciosGestionStyles as TableStyles } from '../../Styles/EjerciciosGestionStyles';
import { Hourglass, Save, X, Image, Edit2, Trash2 } from "lucide-react";

export const FrasesManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const { 
        frases, loading, uploading, isAdmin,
        editingId, editForm, 
        selectedImage,
        imageUrl, setImageUrl,
        handleDelete, startEdit, cancelEdit, saveEdit, 
        handleEditInputChange, handleImageChange
    } = useFrasesManager();

    const filteredFrases = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return frases;
        return frases.filter((f) => {
            if (editingId != null && f.id === editingId) return true;
            return f.texto.toLowerCase().includes(q);
        });
    }, [frases, searchTerm, editingId]);

    const handleNewFrase = () => {
        startEdit(undefined); // undefined signifies new phrase
    };

    if (!isAdmin) {
        return (
            <div className={`${AppStyles.principalContainer} flex justify-center items-center`}>
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
                    <h2 className="text-red-400 text-xl font-bold mb-2">Acceso Denegado</h2>
                    <p className="text-gray-400">Solo los administradores pueden gestionar las frases motivacionales.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto space-y-6"> 
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-wide">Frases Motivacionales</h2>
                        <p className="text-gray-400 text-sm mt-1">Gestión de las frases y sus imágenes relacionadas para mostrar en el Home del alumno.</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar frase..."
                            className={`${AppStyles.inputDark} h-10 text-sm bg-gray-900/60 w-full md:w-64`}
                        />
                        <button 
                            onClick={handleNewFrase} 
                            className={`${AppStyles.btnPrimary} flex items-center justify-center gap-2 px-6 flex-none h-10 whitespace-nowrap`}
                            disabled={editingId === -1}
                        >
                            <span>+</span> Nueva Frase
                        </button>
                    </div>
                </div>

                <div className={TableStyles.tableContainer}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-green-500/50"></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className={TableStyles.tableHeaderRow}>
                                <tr>
                                    <th className={`${TableStyles.th} w-2/3`}>Texto de la Frase</th>
                                    <th className={TableStyles.th}>Imagen</th>
                                    <th className={`${TableStyles.th} text-right`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                
                                {/* Fila especial para NUEVA frase si editingId es -1 */}
                                {editingId === -1 && (
                                    <tr className={`${TableStyles.tr} bg-blue-500/10`}>
                                        <td className={TableStyles.td}>
                                            <input 
                                                className={TableStyles.editInput} 
                                                value={editForm.texto} 
                                                onChange={(e) => handleEditInputChange('texto', e.target.value)} 
                                                placeholder="Ej: El dolor que sientes hoy..."
                                                autoFocus 
                                            />
                                        </td>
                                        <td className={TableStyles.td}>
                                            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-2 w-max transition-colors">
                                                <span>{selectedImage ? <span className="flex items-center gap-1"><Image className="w-4 h-4" /> Seleccionada</span> : <span className="flex items-center gap-1"><Image className="w-4 h-4" /> Subir</span>}</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        </td>
                                        <td className={`${TableStyles.td} text-right space-x-2`}>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={saveEdit} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnSave}`}>{uploading ? <Hourglass className="w-4 h-4" /> : <Save className="w-4 h-4" />}</button>
                                                <button onClick={cancelEdit} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnCancel}`}><X className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {loading ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">Cargando...</td></tr>
                                ) : filteredFrases.length === 0 && editingId !== -1 ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">No hay frases guardadas.</td></tr>
                                ) : filteredFrases.map((f) => {
                                    const isEditing = editingId === f.id;
                                    return (
                                        <tr key={f.id} className={TableStyles.tr}>
                                            {/* COLUMNA TEXTO */}
                                            <td className={TableStyles.td + " font-medium text-white"}>
                                                {isEditing ? (
                                                    <input 
                                                        className={TableStyles.editInput} 
                                                        value={editForm.texto} 
                                                        onChange={(e) => handleEditInputChange('texto', e.target.value)} 
                                                        autoFocus 
                                                    />
                                                ) : <span className="text-gray-300 italic">"{f.texto}"</span>}
                                            </td>

                                            {/* COLUMNA IMAGEN */}
                                            <td className={TableStyles.td}>
                                                {isEditing ? (
                                                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-2 w-max">
                                                        <span>{selectedImage ? <span className="flex items-center gap-1"><Image className="w-4 h-4" /> Listo</span> : <span className="flex items-center gap-1"><Image className="w-4 h-4" /> Cambiar</span>}</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                    </label>
                                                ) : (
                                                    f.imagenUrl ? (
                                                        <button onClick={() => setImageUrl(f.imagenUrl!)} className="text-purple-400 hover:text-purple-300 underline text-sm flex items-center gap-1"><Image className="w-4 h-4" /> Ver</button>
                                                    ) : <span className="text-gray-600 text-sm italic">-</span>
                                                )}
                                            </td>

                                            {/* COLUMNA ACCIONES */}
                                            <td className={`${TableStyles.td} text-right space-x-2`}>
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={saveEdit} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnSave}`}>{uploading ? <Hourglass className="w-4 h-4" /> : <Save className="w-4 h-4" />}</button>
                                                        <button onClick={cancelEdit} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnCancel}`}><X className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEdit(f)} className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit} flex items-center justify-center`} title="Editar"><Edit2 className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDelete(f.id)} className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete} flex items-center justify-center`} title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL IMAGEN */}
            {imageUrl && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out" onClick={() => setImageUrl(null)}>
                    <img src={imageUrl} alt="Frase" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10" />
                </div>,
                document.body
            )}
        </div>
    );
};
