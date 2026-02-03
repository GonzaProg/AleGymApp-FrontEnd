import { createPortal } from "react-dom";
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { useGeneralRoutinesManager } from "../../Hooks/GeneralRoutinesManager/useGeneralRoutinesManager";

export const GeneralRoutinesManager = ({ onNavigate, onEdit }: { onNavigate: (tab: string) => void, onEdit: (id: number) => void }) => {
    const {
        rutinas, loading,
        isAssignModalOpen, setIsAssignModalOpen, openAssignModal, selectedRutina,
        busqueda, handleSearchChange, sugerencias, mostrarSugerencias, setMostrarSugerencias, handleSelectAlumno, alumnoSeleccionado,
        handleAsignar, handleDelete
    } = useGeneralRoutinesManager();

    return (
        <div className="w-full h-full flex flex-col pt-6 px-4 animate-fade-in pb-20">
            <div className="w-full max-w-7xl mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="text-left">
                        <h1 className={AppStyles.title}>Rutinas Generales 📚</h1>
                        <p className={AppStyles.subtitle}>Plantillas de entrenamiento reutilizables.</p>
                    </div>
                    <Button onClick={() => onNavigate("Crear Rutina General")} className={AppStyles.btnPrimary}>
                        + NUEVA PLANTILLA
                    </Button>
                </div>

                {/* LISTA GRID */}
                {loading ? (
                    <div className="text-center py-20 text-white animate-pulse">Cargando biblioteca de rutinas...</div>
                ) : rutinas.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-gray-400 mb-4">No hay rutinas generales creadas.</p>
                        <Button onClick={() => onNavigate("Crear Rutina General")} className={AppStyles.btnSecondary}>
                            Crear la primera
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rutinas.map((rutina) => (
                            <Card key={rutina.id} className={`${AppStyles.glassCard} hover:border-blue-500/50 transition-all flex flex-col relative group`}>
                                
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-white line-clamp-1" title={rutina.nombreRutina}>
                                        {rutina.nombreRutina}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEdit(rutina.id)}
                                            className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit}`} 
                                            title="Editar Plantilla"
                                        >
                                            ✏️
                                        </button>

                                        <button 
                                            onClick={() => handleDelete(rutina)}
                                            className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete}`} 
                                            title="Eliminar Plantilla"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 flex-grow">
                                    <div className="text-sm text-gray-300">
                                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-500/30 mr-2">
                                            GENERAL
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Creada: {new Date(rutina.fechaCreacion).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm">
                                        Contains <b>{rutina.detalles?.length || 0} ejercicios</b>.
                                    </p>

                                    {/* Preview ejercicios (Max 3) */}
                                    <div className="mt-3 space-y-1">
                                        {rutina.detalles?.slice(0, 3).map((d: any, i: number) => (
                                            <div key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                                • {d.ejercicio.nombre} 
                                            </div>
                                        ))}
                                        {(rutina.detalles?.length || 0) > 3 && (
                                            <div className="text-xs text-gray-600 italic">... y {rutina.detalles.length - 3} más</div>
                                        )}
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => openAssignModal(rutina)} 
                                    className={`${AppStyles.btnPrimary} w-full mt-auto border-blue-500/30 hover:bg-blue-600 hover:text-white`}
                                >
                                    📤 ASIGNAR A ALUMNO
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                {/* MODAL ASIGNAR */}
                {isAssignModalOpen && selectedRutina && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className={`${AppStyles.modalContent} max-w-md w-full p-6 relative overflow-visible`}>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Asignar Rutina</h2>
                            <h3 className="text-xl text-blue-400 font-bold mb-6">{selectedRutina.nombreRutina}</h3>
                            <p className="text-gray-300 mb-4 text-sm">
                                Busca al alumno para vincularle esta rutina.
                            </p>

                            <div className="space-y-6">
                                <div className="relative">
                                    <Input 
                                        label="Buscar Alumno"
                                        value={busqueda}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onFocus={() => busqueda && setMostrarSugerencias(true)}
                                        placeholder="Nombre..."
                                        className={AppStyles.inputDark}
                                        labelClassName={AppStyles.label}
                                    />
                                    
                                    {mostrarSugerencias && sugerencias.length > 0 && (
                                        <ul className={AppStyles.suggestionsList}>
                                            {sugerencias.map((alumno: any) => (
                                                <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className={AppStyles.suggestionItem}>
                                                    <div className={AppStyles.avatarSmall}>{alumno.nombre.charAt(0)}</div>
                                                    <span className="font-medium text-gray-200 group-hover:text-white">
                                                        {alumno.nombre} {alumno.apellido}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-2">
                                    <button 
                                        onClick={() => setIsAssignModalOpen(false)} 
                                        className={`${AppStyles.btnSecondary} w-full`}
                                    >
                                        CANCELAR
                                    </button>
                                    <Button 
                                        onClick={handleAsignar} 
                                        disabled={!alumnoSeleccionado}
                                        className={`${AppStyles.btnPrimary} w-full disabled:opacity-50`}
                                    >
                                        CONFIRMAR
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>,
                    document.body
                )}

            </div>
        </div>
    );
};