import { AppStyles } from "../../Styles/AppStyles";
import { Card } from "../../Components/UI/Card";
import { Button } from "../../Components/UI/Button";
import { Input } from "../../Components/UI/Input";
import { useUserRoutinesManager } from "../../Hooks/Rutinas/useUserRoutinesManager";

export const UserRoutinesManager = ({ onNavigate, onEdit }: { onNavigate: (tab: string) => void, onEdit: (id: number) => void }) => {
    const {
        rutinasAlumno, loading,
        busqueda, handleSearchChange, sugerencias, mostrarSugerencias, setMostrarSugerencias,
        handleSelectAlumno, alumnoSeleccionado, clearSelection,
        handleDelete, handleUnlink, canEditRoutine
    } = useUserRoutinesManager();

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
                        <div className="absolute right-4 top-8 text-gray-400">
                            🔍
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
                        {rutinasAlumno.map((rutina: any) => (
                            <Card key={rutina.id} className={`${AppStyles.glassCard} hover:border-green-500/50 transition-all flex flex-col relative group`}>
                                
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-bold text-white line-clamp-1" title={rutina.nombreRutina}>
                                        {rutina.nombreRutina}
                                    </h3>
                                    <div className="flex gap-2">
                                        {canEditRoutine(rutina) && (
                                            <>
                                                <button 
                                                    onClick={() => onEdit(rutina.id)}
                                                    className={`${AppStyles.btnIconBase} ${AppStyles.btnEdit}`} 
                                                    title="Editar Rutina Personal"
                                                >
                                                    ✏️
                                                </button>

                                                <button 
                                                    onClick={() => handleDelete(rutina)}
                                                    className={`${AppStyles.btnIconBase} ${AppStyles.btnDelete}`} 
                                                    title="Eliminar Rutina Personal"
                                                >
                                                    🗑️
                                                </button>
                                            </>
                                        )}
                                        {!canEditRoutine(rutina) && (
                                            <>
                                                <button 
                                                    onClick={() => handleUnlink(rutina)}
                                                    className={`${AppStyles.btnIconBase} bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border-orange-500/20`} 
                                                    title="Desvincular Rutina General del Alumno"
                                                >
                                                    🔗
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 flex-grow">
                                    <div className="text-sm text-gray-300">
                                        <span className={`${rutina.esGeneral ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'} px-2 py-0.5 rounded text-xs border ${rutina.esGeneral ? 'border-blue-500/30' : 'border-green-500/30'} mr-2`}>
                                            {rutina.esGeneral ? 'GENERAL' : 'PERSONAL'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Creada: {new Date(rutina.fechaCreacion).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm">
                                        Entrenador: <b className="text-white">{rutina.entrenador}</b>
                                    </p>

                                    {rutina.usuario && (
                                        <p className="text-gray-400 text-sm">
                                            Alumno: <b className="text-green-400">{rutina.usuario.nombre}</b>
                                        </p>
                                    )}
                                    
                                    <p className="text-gray-400 text-sm">
                                        Contiene <b>{rutina.detalles?.length || 0} ejercicios</b>.
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

                                <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
                                    {canEditRoutine(rutina) ? (
                                        <span className="text-green-400">✓ Editable</span>
                                    ) : (
                                        <span className="text-blue-400">ℹ️ Gestión desde Rutinas Generales</span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
