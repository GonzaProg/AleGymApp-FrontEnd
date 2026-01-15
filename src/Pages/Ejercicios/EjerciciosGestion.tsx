import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.jpg';
import { useEjerciciosGestion } from '../../Hooks/Ejercicios/useEjerciciosGestion';
import { AppStyles } from '../../Styles/AppStyles';
import { EjerciciosGestionStyles as TableStyles } from '../../Styles/EjerciciosGestionStyles';
import { VideoEjercicio } from '../../Components/VideoEjercicios/VideoEjercicio';

export const EjerciciosGestion = () => {
    const navigate = useNavigate();
    
    const { 
        ejercicios, loading, uploading, editingId, editForm, 
        selectedVideo, selectedImage,
        videoUrl, imageUrl, // Estados Modales
        handleDelete, startEdit, cancelEdit, saveEdit, 
        handleEditInputChange, handleVideoChange, handleImageChange,
        setVideoUrl, setImageUrl
    } = useEjerciciosGestion();

    return (
        <div className={AppStyles.pageContainer}>
             <div className={AppStyles.fixedBackground} style={{ backgroundImage: `url(${fondoGym})` }} />
            <Navbar />

            <div className={AppStyles.contentContainer}>
                <div className="w-full max-w-7xl space-y-6"> {/* Hacemos más ancha la tabla */}
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className={AppStyles.title.replace("text-center", "")}>Gestión Ejercicios</h2>
                        <button onClick={() => navigate('/ejercicios/crear')} className={`${AppStyles.btnPrimary} flex items-center gap-2 px-6 flex-none w-auto`}>
                            <span>+</span> Nuevo Ejercicio
                        </button>
                    </div>

                    {/* Tabla */}
                    <div className={TableStyles.tableContainer}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-green-500/50"></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className={TableStyles.tableHeaderRow}>
                                    <tr>
                                        <th className={TableStyles.th}>Nombre</th>
                                        <th className={TableStyles.th}>Imagen</th> {/* Nueva Columna */}
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
                                                
                                                {/* NOMBRE */}
                                                <td className={TableStyles.td + " font-medium text-white"}>
                                                    {isEditing ? (
                                                        <input className={TableStyles.editInput} value={editForm.nombre} onChange={(e) => handleEditInputChange('nombre', e.target.value)} autoFocus />
                                                    ) : <span className="text-lg">{ej.nombre}</span>}
                                                </td>

                                                {/* IMAGEN */}
                                                <td className={TableStyles.td}>
                                                    {isEditing ? (
                                                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-2 w-max">
                                                            <span>{selectedImage ? '🖼️ Seleccionada' : '🖼️ Cambiar Img'}</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                        </label>
                                                    ) : (
                                                        ej.imagenUrl ? (
                                                            <button onClick={() => setImageUrl(ej.imagenUrl!)} className="text-purple-400 hover:text-purple-300 underline text-sm flex items-center gap-1">
                                                                🖼️ Ver Imagen
                                                            </button>
                                                        ) : <span className="text-gray-600 text-sm italic">-</span>
                                                    )}
                                                </td>

                                                {/* VIDEO */}
                                                <td className={TableStyles.td}>
                                                    {isEditing ? (
                                                        <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-2 w-max">
                                                            <span>{selectedVideo ? '📹 Seleccionado' : '📹 Cambiar Video'}</span>
                                                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                                                        </label>
                                                    ) : (
                                                        ej.urlVideo ? (
                                                            <button onClick={() => setVideoUrl(ej.urlVideo!)} className={TableStyles.videoLink}>
                                                                📺 Ver Video
                                                            </button>
                                                        ) : <span className="text-gray-600 text-sm italic">-</span>
                                                    )}
                                                </td>

                                                {/* ACCIONES */}
                                                <td className={`${TableStyles.td} text-right space-x-2`}>
                                                    {isEditing ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => saveEdit(ej.id)} disabled={uploading} className={`${AppStyles.actionBtnBase} ${AppStyles.btnSave}`}>
                                                                {uploading ? '...' : '💾'}
                                                            </button>
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
                    
                    <div className="mt-8"><button onClick={() => navigate('/ejercicios')} className={AppStyles.btnBack}>⬅ Volver</button></div>
                </div>
            </div>

            {/* MODAL VIDEO */}
            {videoUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setVideoUrl(null)}>
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden border border-white/20">
                        <VideoEjercicio url={videoUrl} />
                    </div>
                </div>
            )}

            {/* MODAL IMAGEN (Lightbox) */}
            {imageUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out" onClick={() => setImageUrl(null)}>
                    <img src={imageUrl} alt="Ejercicio" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-white/10" />
                </div>
            )}

        </div>
    );
};