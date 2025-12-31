import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../Components/Navbar';
import fondoGym from '../../assets/Fondo-CreateRoutine.png';
import { useEjerciciosGestion } from '../../Hooks/Ejercicios/useEjerciciosGestion';
import { AppStyles } from '../../Styles/AppStyles';
import { EjerciciosGestionStyles, EjerciciosGestionStyles as TableStyles } from '../../Styles/EjerciciosGestionStyles'; // Alias TableStyles para que sea corto

export const EjerciciosGestion = () => {
    const navigate = useNavigate();
    
    const { 
        ejercicios, loading, editingId, editForm, 
        handleDelete, startEdit, cancelEdit, saveEdit, handleEditInputChange 
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
                        <h2 className={AppStyles.title.replace("text-center", "")}> {/* Reutilizamos y quitamos center */}
                            Gestión <span className={AppStyles.highlight}>Ejercicios</span>
                        </h2>
                        <button 
                            onClick={() => navigate('/ejercicios/crear')}
                            className={`${AppStyles.btnPrimary} flex items-center gap-2 px-6 flex-none w-auto`} // Ajuste de flex
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
                                        <th className={TableStyles.th}>Video URL</th>
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
                                                            <input 
                                                                className={TableStyles.editInput}
                                                                value={editForm.urlVideo}
                                                                onChange={(e) => handleEditInputChange('urlVideo', e.target.value)}
                                                                placeholder="URL del video"
                                                            />
                                                        ) : (
                                                            ej.urlVideo ? (
                                                                <a href={ej.urlVideo} target="_blank" rel="noreferrer" className={TableStyles.videoLink}>
                                                                    📺 Ver Video
                                                                </a>
                                                            ) : <span className="text-gray-600 text-sm italic">Sin video</span>
                                                        )}
                                                    </td>

                                                    {/* ACCIONES */}
                                                    <td className={`${TableStyles.td} text-right space-x-2`}>
                                                        {isEditing ? (
                                                            <>
                                                                <button onClick={() => saveEdit(ej.id)} className={`${TableStyles.actionBtnBase} ${TableStyles.btnSave}`}>Guardar</button>
                                                                <button onClick={cancelEdit} className={`${TableStyles.actionBtnBase} ${TableStyles.btnCancel}`}>Cancelar</button>
                                                            </>
                                                        ) : (
                                                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => startEdit(ej)} className={`${TableStyles.btnIconBase} ${TableStyles.btnEdit}`} title="Editar">
                                                                    ✏️
                                                                </button>
                                                                <button onClick={() => handleDelete(ej.id)} className={`${TableStyles.btnIconBase} ${TableStyles.btnDelete}`} title="Eliminar">
                                                                    🗑️
                                                                </button>
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
        </div>
    );
};