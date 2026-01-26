import { useDeleteRoutine } from "../../Hooks/DeleteRoutine/useDeleteRoutine";
import { Button } from "../../Components/UI/Button";
import { AppStyles } from "../../Styles/AppStyles";
import { DeleteRoutineStyles } from "../../Styles/DeleteRoutineStyles";

export const DeleteRoutine = () => {
  const { 
    busqueda, 
    sugerencias, 
    mostrarSugerencias, 
    alumnoSeleccionado, 
    rutinas, 
    setMostrarSugerencias, 
    handleSearchChange, 
    handleSelectAlumno, 
    handleDelete 
  } = useDeleteRoutine();

  return (
    <div className="w-full h-full flex flex-col pt-6 animate-fade-in">
        <div className="container mx-auto px-4 max-w-5xl">
            
            {/* HEADER */}
            <div className="text-center mb-10">
                <h2 className={DeleteRoutineStyles.redTitle}>
                    <span>🗑️</span> Borrar Rutinas
                </h2>
                <p className={AppStyles.subtitle}>
                    Busca un alumno y elimina las rutinas obsoletas.
                </p>
            </div>

            <div className={DeleteRoutineStyles.searchWrapper}>
                {/* Brillo Rojo de fondo */}
                <div className={DeleteRoutineStyles.searchGlow}></div>
                
                <div className="relative">
                    <input 
                        type="text"
                        value={busqueda} 
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => busqueda && setMostrarSugerencias(true)}
                        placeholder="🔍 Buscar alumno por nombre..."
                        className={DeleteRoutineStyles.searchInput} 
                    />
                    
                    {/* LISTA DE SUGERENCIAS */}
                    {mostrarSugerencias && sugerencias.length > 0 && (
                        <ul className={AppStyles.suggestionsList}>
                            {sugerencias.map((alumno) => (
                                <li 
                                    key={alumno.id} 
                                    onClick={() => handleSelectAlumno(alumno)} 
                                    className={`${AppStyles.suggestionItem} hover:bg-red-500/20`}
                                >
                                    <div className={`${AppStyles.avatarSmall} bg-gray-800 text-red-400 border-red-500/30`}>
                                        {alumno.nombre.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-200 font-medium">{alumno.nombre} {alumno.apellido}</span>
                                        <span className="text-xs text-gray-500">{alumno.email}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* --- RESULTADOS --- */}
            {alumnoSeleccionado && (
                <div className="animate-fade-in-up mt-12 pb-20">
                    
                    <h3 className="text-2xl font-bold text-white mb-6 pl-4 border-l-4 border-red-500 flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-transparent py-2 rounded-r-lg">
                        Rutinas de <span className="text-red-400">{alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</span>
                    </h3>
                    
                    {rutinas.length === 0 ? (
                        <div className={`${AppStyles.glassCard} text-center py-12 flex flex-col items-center justify-center border-dashed border-2 border-gray-700`}>
                            <span className="text-5xl opacity-30 mb-4 grayscale">📂</span>
                            <p className="text-gray-400 text-lg">Este alumno no tiene rutinas asignadas.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {rutinas.map(rutina => (
                                <div key={rutina.id} className={DeleteRoutineStyles.itemRedList}>
                                    
                                    <div className="absolute left-0 top-0 h-full w-1 bg-red-600 group-hover:w-2 transition-all duration-300"></div>
                                    
                                    <div className="pl-6">
                                        <h4 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                                            {rutina.nombreRutina}
                                        </h4>
                                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                            📅 Creada el: <span className="text-gray-300">{new Date(rutina.fechaCreacion).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                    
                                    <Button 
                                        onClick={() => handleDelete(rutina.id)}
                                        className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/30 font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-red-900/10"
                                    >
                                        <span>🗑️</span> Eliminar
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};