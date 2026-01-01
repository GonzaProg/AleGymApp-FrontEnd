import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.png';
import { useEjerciciosGestion } from '../../Hooks/Ejercicios/useEjerciciosGestion';
import { AppStyles } from '../../Styles/AppStyles';
import { EjerciciosGestionStyles, EjerciciosGestionStyles as TableStyles } from '../../Styles/EjerciciosGestionStyles';
import { VideoEjercicio } from '../../Components/VideoEjercicios/VideoEjercicio';

export const EjerciciosGestion = () => {
    const navigate = useNavigate();
    
    // RECIBIR LOS NUEVOS ESTADOS DEL HOOK
    const { 
        ejercicios, loading, uploading, editingId, editForm, selectedFile,
        videoUrl,
        handleDelete, startEdit, cancelEdit, saveEdit, handleEditInputChange, handleFileChange,
        handleOpenVideo, closeVideo 
    } = useEjerciciosGestion();

    return (
        <div className={AppStyles.pageContainer}>
             <div
                className={AppStyles.fixedBackground}
                style={{ backgroundImage: `url(${fondoGym})`,
                filter: 'brightness(0.8) contrast(1.1)'  }}
            />

            <Navbar />

            <div className={AppStyles.contentContainer}>
                <div className="w-full max-w-6xl space-y-6">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className={AppStyles.title.replace("text-center", "")}>
                            Gestión <span className={AppStyles.highlight}>Ejercicios</span>
                        </h2>
                        <button 
                            onClick={() => navigate('/ejercicios/crear')}
                            className={`${AppStyles.btnPrimary} flex items-center gap-2 px-6 flex-none w-auto`}
                        >
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
                                        <th className={TableStyles.th}>Video</th>
                                        <th className={`${TableStyles.th} text-right`}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400 italic">Cargando catálogo...</td></tr>
                                    ) : ejercicios.length === 0 ? (
                                        <tr><td colSpan={3} className="p-8 text-center text-gray-400">No hay ejercicios registrados.</td></tr>
                                    ) : (
                                        ejercicios.map((ej) => {
                                            const isEditing = editingId === ej.id;
                                            return (
                                                <tr key={ej.id} className={TableStyles.tr}>
                                                    
                                                    {/* NOMBRE */}
                                                    <td className={TableStyles.td + " font-medium text-white"}>
                                                        {isEditing ? (
                                                            <input 
                                                                className={TableStyles.editInput}
                                                                value={editForm.nombre}
                                                                onChange={(e) => handleEditInputChange('nombre', e.target.value)}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="text-lg">{ej.nombre}</span>
                                                        )}
                                                    </td>

                                                    {/* VIDEO */}
                                                    <td className={TableStyles.td}>
                                                        {isEditing ? (
                                                            <div className="flex flex-col gap-1">
                                                                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-500 text-white text-xs py-2 px-3 rounded flex items-center justify-center gap-2 w-full transition-all">
                                                                    <span>{selectedFile ? '📁' : '📤'}</span>
                                                                    <span>{selectedFile ? 'Video Seleccionado' : 'Cambiar Video'}</span>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="video/*" 
                                                                        className="hidden" 
                                                                        onChange={handleFileChange}
                                                                    />
                                                                </label>
                                                                {selectedFile ? (
                                                                    <span className="text-xs text-green-400 truncate max-w-[200px]">Nuevo: {selectedFile.name}</span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                                        {editForm.urlVideo ? 'Mantiene video actual' : 'Sin video actualmente'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            ej.urlVideo ? (
                                                                <button 
                                                                    onClick={() => handleOpenVideo(ej.urlVideo!)} 
                                                                    className={TableStyles.videoLink}
                                                                >
                                                                    📺 Ver Video
                                                                </button>
                                                            ) : <span className="text-gray-600 text-sm italic">Sin video</span>
                                                        )}
                                                    </td>

                                                    {/* ACCIONES */}
                                                    <td className={`${TableStyles.td} text-right space-x-2`}>
                                                        {isEditing ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={() => saveEdit(ej.id)} 
                                                                    disabled={uploading}
                                                                    className={`${TableStyles.actionBtnBase} ${TableStyles.btnSave} disabled:opacity-50 disabled:cursor-wait`}
                                                                >
                                                                    {uploading ? 'Subiendo...' : 'Guardar'}
                                                                </button>
                                                                <button 
                                                                    onClick={cancelEdit} 
                                                                    disabled={uploading}
                                                                    className={`${TableStyles.actionBtnBase} ${TableStyles.btnCancel} disabled:opacity-50`}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => startEdit(ej)} className={`${TableStyles.btnIconBase} ${TableStyles.btnEdit}`} title="Editar">✏️</button>
                                                                <button onClick={() => handleDelete(ej.id)} className={`${TableStyles.btnIconBase} ${TableStyles.btnDelete}`} title="Eliminar">🗑️</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <button onClick={() => navigate('/ejercicios')} className={EjerciciosGestionStyles.btnBack}>
                            ⬅ Volver al Menú
                        </button>
                    </div>

                </div>
            </div>

            {/* 4. AQUI AGREGAMOS EL MODAL DE VIDEO (IGUAL QUE EN MYROUTINES) */}
            {videoUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                        {/* Botón cerrar */}
                        <button 
                            onClick={closeVideo} 
                            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 hover:bg-red-500/80 rounded-full text-white text-xl font-bold transition-all"
                        >
                            &times;
                        </button>
                        
                        {/* Componente de Video */}
                        <VideoEjercicio url={videoUrl} />
                    </div>
                </div>
            )}

        </div>
    );
};