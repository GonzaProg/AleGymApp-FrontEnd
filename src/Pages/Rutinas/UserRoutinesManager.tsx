import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { useUserRoutinesManager } from "../../Hooks/Rutinas/useUserRoutinesManager";
import { Search, Edit2, Trash2, Link as LinkIcon, CheckCircle2, Info, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export const UserRoutinesManager = ({ onNavigate, onEdit, onEditGroup }: { onNavigate: (tab: string) => void, onEdit: (id: number) => void, onEditGroup: (grupoId: string) => void }) => {
    const {
        rutinasAlumno, loading,
        busqueda, handleSearchChange, sugerencias, mostrarSugerencias, setMostrarSugerencias,
        handleSelectAlumno, alumnoSeleccionado, clearSelection,
        handleDelete, handleUnlink
    } = useUserRoutinesManager();

    // Estado para expandir/contraer vista de días en cards de grupo
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const toggleExpand = (key: string) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className={AppStyles.principalContainer}>
            <div className="w-full max-w-7xl mx-auto">
                
                {/* HEADER CON BOTÓN DE CREAR */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className={AppStyles.headerContainer}>
                        <p className={AppStyles.subtitle}>Gestiona las rutinas personales de los usuarios.</p>
                    </div>
                    <Button onClick={() => onNavigate("Crear Rutina")} className={AppStyles.btnPrimary}>
                        + CREAR RUTINA PERSONALIZADA
                    </Button>
                </div>

                {/* BUSCADOR HERO */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Input 
                            label="Buscar Alumno"
                            value={busqueda}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => busqueda && setMostrarSugerencias(true)}
                            placeholder="Buscar por nombre de alumno..."
                            className={`${AppStyles.inputDark} text-lg`}
                            labelClassName={AppStyles.label}
                        />
                        <div className="absolute right-4 top-9 text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        
                        {/* SUGERENCIAS DE ALUMNOS */}
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
                </div>

                {/* ALUMNO SELECCIONADO */}
                {alumnoSeleccionado && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <p className="text-green-400 font-medium">
                            Alumno seleccionado: <span className="text-white font-bold">{alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</span>
                            <button 
                                onClick={clearSelection}
                                className="ml-4 text-red-400 hover:text-red-300 text-sm underline"
                            >
                                (Cambiar)
                            </button>
                        </p>
                    </div>
                )}

                {/* LISTA GRID */}
                {!alumnoSeleccionado ? (
                    <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/10">
                        <p className="text-white mb-4">
                            Busca un alumno para ver sus rutinas asignadas.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="text-center py-20 text-white animate-pulse">Cargando rutinas del alumno...</div>
                ) : rutinasAlumno.length === 0 ? (
                    <div className="text-center py-20 bg-white/10 rounded-2xl border border-white/10">
                        <p className="text-white mb-4">
                            El alumno {alumnoSeleccionado.nombre} no tiene rutinas asignadas.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rutinasAlumno.map((rutina: any) => {
                            const esGrupo = rutina.esGrupo;
                            const key = esGrupo ? rutina.grupoId : `r-${rutina.id}`;
                            const isExpanded = expandedGroups[key];
                            
                            const totalEjercicios = esGrupo 
                                ? rutina.dias.reduce((sum: number, d: any) => sum + (d.detalles?.length || 0), 0)
                                : (rutina.detalles?.length || 0);

                            return (
                                <Card key={key} className={`${AppStyles.glassCard} hover:border-green-500/50 transition-all flex flex-col relative group`}>
                                    
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-xl font-bold text-white break-words leading-tight" title={rutina.nombreRutina}>
                                            {rutina.nombreRutina}
                                        </h3>
                                        <div className="flex gap-2">
                                            {rutina.esGeneral ? (
                                                <button 
                                                    onClick={() => handleUnlink(rutina)}
                                                    className={`${AppStyles.btnIconBase} bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border-orange-500/20`} 
                                                    title="Desvincular Rutina General del Alumno"
                                                >
                                                    <LinkIcon className="w-4 h-4 ml-1" />
                                                </button>
                                            ) : esGrupo ? (
                                                <>
                                                    <button 
                                                        onClick={() => onEditGroup(rutina.grupoId)}
                                                        className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit}`} 
                                                        title="Editar Rutina Multi-Día"
                                                    >
                                                        <Edit2 className="w-4 h-4 ml-1" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(rutina)}
                                                        className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete}`} 
                                                        title="Eliminar todos los días"
                                                    >
                                                        <Trash2 className="w-4 h-4 ml-1" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => onEdit(rutina.id)}
                                                        className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit}`} 
                                                        title="Editar Rutina Personal"
                                                    >
                                                        <Edit2 className="w-4 h-4 ml-1" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(rutina)}
                                                        className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete}`} 
                                                        title="Eliminar Rutina Personal"
                                                    >
                                                        <Trash2 className="w-4 h-4 ml-1" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 flex-grow">
                                        <div className="text-sm text-gray-300 flex flex-wrap gap-2">
                                            <span className={`${rutina.esGeneral ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'} px-2 py-0.5 rounded text-xs border ${rutina.esGeneral ? 'border-blue-500/30' : 'border-green-500/30'}`}>
                                                {rutina.esGeneral ? 'GENERAL' : 'PERSONAL'}
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
                                            Entrenador: <b className="text-white">{rutina.entrenador}</b>
                                        </p>

                                        {rutina.usuario && !esGrupo && (
                                            <p className="text-gray-400 text-sm">
                                                Alumno: <b className="text-green-400">{rutina.usuario.nombre}</b>
                                            </p>
                                        )}
                                        
                                        <p className="text-gray-400 text-sm">
                                            Contiene <b>{totalEjercicios} ejercicios</b>{esGrupo ? ` en ${rutina.dias.length} días` : ''}.
                                        </p>

                                        {/* Preview ejercicios */}
                                        {esGrupo ? (
                                            <>
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

                                    <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
                                        {rutina.esGeneral ? (
                                            <span className="text-blue-400 flex items-center gap-1"><Info className="w-4 h-4" /> Gestión desde Rutinas Generales</span>
                                        ) : esGrupo ? (
                                            <span className="text-purple-400 flex items-center gap-1"><Calendar className="w-4 h-4" /> Rutina Multi-Día</span>
                                        ) : (
                                            <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Editable</span>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
