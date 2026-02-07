import { useNavigate } from 'react-router-dom';
import { createPortal } from "react-dom";
import { useEjerciciosGestion } from '../../Hooks/Ejercicios/useEjerciciosGestion';
import { AppStyles } from '../../Styles/AppStyles';
import { EjerciciosGestionStyles as TableStyles } from '../../Styles/EjerciciosGestionStyles';
import { VideoEjercicio } from '../../Components/VideoEjercicios/VideoEjercicio';

// Definimos la interfaz para recibir la función de navegación
interface Props {
    onNavigate?: (tab: string) => void;
}

export const EjerciciosGestion = ({ onNavigate }: Props) => {
    const navigate = useNavigate();
    
    const { 
        ejercicios, loading, uploading, editingId, editForm, 
        selectedVideo, selectedImage,
        videoUrl, imageUrl, 
        handleDelete, startEdit, cancelEdit, saveEdit, 
        handleEditInputChange, handleVideoChange, handleImageChange,
        setVideoUrl, setImageUrl
    } = useEjerciciosGestion();

    // Función que decide cómo navegar
    const handleNewExercise = () => {
        if (onNavigate) {
            // Si estamos en el Dashboard, cambiamos el tab internamente
            onNavigate('Crear Ejercicio');
        } else {
            // Si accedimos por URL directa, usamos router
            navigate('/ejercicios/crear');
        }
    };

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto space-y-6"> 
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-end gap-4 mt-10">
                    
                    {/* BOTÓN CON LÓGICA SPA */}
                    <button 
                        onClick={handleNewExercise} 
                        className={`${AppStyles.btnPrimary} flex items-center gap-2 px-6 flex-none w-auto`}
                    >
                        <span>+</span> Nuevo Ejercicio
                    </button>
                </div>

                {/* ... (El resto de la tabla y modales sigue IDÉNTICO a lo que te pasé antes) ... */}
                <div className={TableStyles.tableContainer}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-green-500/50"></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className={TableStyles.tableHeaderRow}>
                                <tr>
                                    <th className={TableStyles.th}>Nombre</th>
                                    <th className={TableStyles.th}>Imagen</th>
                                    <th className={TableStyles.th}>Video</th>
                                    <th className={`${TableStyles.th} text-right`}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Cargando...</td></tr>
                                ) : ejercicios.map((ej) => {
                                    const isEditing = editingId === ej.id;
                                    return (
                                        <tr key={ej.id} className={TableStyles.tr}>
                                            <td className={TableStyles.td + " font-medium text-white"}>
                                                {isEditing ? (
                                                    <input className={TableStyles.editInput} value={editForm.nombre} onChange={(e) => handleEditInputChange('nombre', e.target.value)} autoFocus />
                                                ) : <span className="text-lg">{ej.nombre}</span>}
                                            </td>
                                            <td className={TableStyles.td}>
                                                {isEditing ? (
                                                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-2 w-max">
                                                        <span>{selectedImage ? '🖼️ Listo' : '🖼️ Cambiar'}</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                    </label>
                                                ) : (
                                                    ej.imagenUrl ? (
                                                        <button onClick={() => setImageUrl(ej.imagenUrl!)} className="text-purple-400 hover:text-purple-300 underline text-sm flex items-center gap-1">🖼️ Ver</button>
                                                    ) : <span className="text-gray-600 text-sm italic">-</span>
                                                )}
                                            </td>
                                            <td className={TableStyles.td}>
                                                {isEditing ? (
                                                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-2 w-max">
                                                        <span>{selectedVideo ? '📹 Listo' : '📹 Cambiar'}</span>
                                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                                                    </label>
                                                ) : (
                                                    ej.urlVideo ? (
                                                        <button onClick={() => setVideoUrl(ej.urlVideo!)} className={TableStyles.videoLink}>📺 Ver</button>
                                                    ) : <span className="text-gray-600 text-sm italic">-</span>
                                                )}
                                            </td>
                                            <td className={`${TableStyles.td} text-right space-x-2`}>
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => saveEdit(ej.id)} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnSave}`}>{uploading ? '...' : '💾'}</button>
                                                        <button onClick={cancelEdit} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnCancel}`}>❌</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => startEdit(ej)} className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit}`} title="Editar">✏️</button>
                                                        <button onClick={() => handleDelete(ej.id)} className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete}`} title="Eliminar">🗑️</button>
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

            {/* MODALES */}
            {videoUrl && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4" onClick={() => setVideoUrl(null)}>
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden border border-white/20">
                        <VideoEjercicio url={videoUrl} />
                    </div>
                </div>,
                document.body
            )}
            {imageUrl && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out" onClick={() => setImageUrl(null)}>
                    <img src={imageUrl} alt="Ejercicio" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10" />
                </div>,
                document.body
            )}
        </div>
    );
};