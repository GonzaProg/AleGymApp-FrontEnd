import { createPortal } from "react-dom";
import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { useGeneralRoutinesManager } from "../../Hooks/Rutinas/useGeneralRoutinesManager";
import { Edit2, Trash2, Send, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export const GeneralRoutinesManager = ({ onNavigate, onEdit, onEditGroup }: { onNavigate: (tab: string) => void, onEdit: (id: number) => void, onEditGroup: (grupoId: string) => void }) => {
    const {
        rutinas, loading,
        isAssignModalOpen, setIsAssignModalOpen, openAssignModal, selectedRutina,
        busqueda, handleSearchChange, sugerencias, mostrarSugerencias, setMostrarSugerencias, handleSelectAlumno, alumnoSeleccionado,
        handleAsignar, handleDelete
    } = useGeneralRoutinesManager();

    // Estado para expandir/contraer vista de días en cards de grupo
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const toggleExpand = (key: string) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className={AppStyles.headerContainer}>
                        <p className={AppStyles.subtitle}>Rutinas de entrenamiento reutilizables.</p>
                    </div>
                    <Button onClick={() => onNavigate("Crear Rutina General")} className={AppStyles.btnPrimary}>
                        + NUEVA RUTINA
                    </Button>
                </div>

                {/* LISTA GRID */}
                {loading ? (
                    <div className="text-center py-20 text-white animate-pulse">Cargando biblioteca de rutinas...</div>
                ) : rutinas.length === 0 ? (
                    <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/10">
                        <p className="text-white mb-4">No hay rutinas generales creadas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rutinas.map((rutina) => {
                            const esGrupo = rutina.esGrupo;
                            const key = esGrupo ? rutina.grupoId : `r-${rutina.id}`;
                            const isExpanded = expandedGroups[key];
                            
                            // Calcular total de ejercicios
                            const totalEjercicios = esGrupo 
                                ? rutina.dias.reduce((sum: number, d: any) => sum + (d.detalles?.length || 0), 0)
                                : (rutina.detalles?.length || 0);

                            return (
                                <Card key={key} className={`${AppStyles.glassCard} hover:border-blue-500/50 transition-all flex flex-col relative group`}>
                                    
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-white break-words leading-tight" title={rutina.nombreRutina}>
                                            {rutina.nombreRutina}
                                        </h3>
                                        <div className="flex gap-2">
                                            {/* Editar: individual o grupo */}
                                            {esGrupo ? (
                                                <button 
                                                    onClick={() => onEditGroup(rutina.grupoId)}
                                                    className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit} flex justify-center items-center`} 
                                                    title="Editar Rutina Multi-Día"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => onEdit(rutina.id)}
                                                    className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit} flex justify-center items-center`} 
                                                    title="Editar Plantilla"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => handleDelete(rutina)}
                                                className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete} flex justify-center items-center`} 
                                                title={esGrupo ? "Eliminar todos los días" : "Eliminar Plantilla"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 flex-grow">
                                        <div className="text-sm text-gray-300 flex flex-wrap gap-2">
                                            <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-500/30">
                                                GENERAL
                                            </span>
                                            {esGrupo && (
                                                <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-500/30 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {rutina.dias.length} días
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                Creada: {new Date(rutina.fechaCreacion).toLocaleDateString()}
                                            </span>
                                        </div>
                                        
                                        <p className="text-gray-400 text-sm">
                                            Contiene <b>{totalEjercicios} ejercicios</b>{esGrupo ? ` en ${rutina.dias.length} días` : ''}.
                                        </p>

                                        {/* Preview ejercicios */}
                                        {esGrupo ? (
                                            <>
                                                {/* Vista expandible de días */}
                                                <button 
                                                    onClick={() => toggleExpand(key)}
                                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    {isExpanded ? 'Ocultar días' : 'Ver días'}
                                                </button>
                                                
                                                {isExpanded && (
                                                    <div className="mt-2 space-y-3">
                                                        {rutina.dias.map((dia: any, diaIndex: number) => (
                                                            <div key={diaIndex} className="bg-black/20 rounded-lg p-3 border border-white/5">
                                                                <p className="text-xs text-green-400 font-bold mb-1.5">Día {diaIndex + 1}</p>
                                                                <div className="space-y-1">
                                                                    {dia.detalles?.slice(0, 3).map((d: any, i: number) => (
                                                                        <div key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                                                            • {d.ejercicio.nombre}
                                                                        </div>
                                                                    ))}
                                                                    {(dia.detalles?.length || 0) > 3 && (
                                                                        <div className="text-xs text-gray-600 italic">... y {dia.detalles.length - 3} más</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
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
                                        )}
                                    </div>

                                    <Button 
                                        onClick={() => openAssignModal(rutina)} 
                                        className={`${AppStyles.btnPrimary} w-full mt-auto border-blue-500/30 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-2`}
                                    >
                                        <Send className="w-4 h-4" /> {esGrupo ? `ASIGNAR ${rutina.dias.length} DÍAS` : 'ASIGNAR A ALUMNO'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* MODAL ASIGNAR */}
                {isAssignModalOpen && selectedRutina && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                        <div className={`${AppStyles.modalContent} max-w-md w-full p-6 relative overflow-visible`}>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Asignar Rutina</h2>
                            <h3 className="text-xl text-blue-400 font-bold mb-2">{selectedRutina.nombreRutina}</h3>
                            {selectedRutina.esGrupo && (
                                <p className="text-purple-300 text-sm mb-4 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Se asignarán los {selectedRutina.dias.length} días al alumno
                                </p>
                            )}
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