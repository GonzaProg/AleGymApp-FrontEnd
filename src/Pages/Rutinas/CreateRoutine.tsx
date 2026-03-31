import { useState, useRef, useEffect } from "react";
import { Play, ChevronDown, Copy } from "lucide-react";
import { createPortal } from "react-dom";
import { useCreateRoutine } from "../../Hooks/Rutinas/useCreateRoutine";
import { Input, Button } from "../../Components/UI";
import { AppStyles } from "../../Styles/AppStyles";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio";

interface CreateRoutineProps {
    isGeneral?: boolean;
    routineIdToEdit?: number | null;
}

export const CreateRoutine = ({ isGeneral = false, routineIdToEdit = null }: CreateRoutineProps) => {
  const {
    // Datos Generales
    nombreRutina, setNombreRutina,
    // Buscador Alumnos
    busqueda, sugerencias, mostrarSugerencias, setMostrarSugerencias, handleSearchChange, handleSelectAlumno, 
    // Datos Display Edición
    alumnoNombreDisplay,
    // Buscador Ejercicios
    ejercicioBusqueda, ejerciciosFiltrados, mostrarSugerenciasEjercicios, 
    handleEjercicioSearchChange, handleSelectEjercicio, setMostrarSugerenciasEjercicios,
    // Formulario Detalle
    series, handleSeriesChange,
    tipoSerie, setTipoSerie,
    repsInicial, handleRepsInicialChange,
    reps, handleRepsChange,
    peso, handlePesoChange,
    pesosArray, handlePesoArrayChange, repsArrayCalculado, handleAutoFillWeights,
    handleAddExercise, 
    detalles, editIndex, handleEditRow, cancelEditRow, handleDeleteRow, 
    moveRowUp, moveRowDown, handleSubmit,
    ejercicios // <-- Extraemos los ejercicios para buscar detalles rápidos
  } = useCreateRoutine(isGeneral, routineIdToEdit); 

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si el modal de video NO está abierto, y el click fue fuera del contenedor del buscador
      if (!previewUrl && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setMostrarSugerenciasEjercicios(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [previewUrl, setMostrarSugerenciasEjercicios]);

  return (
    <div className={`${AppStyles.principalContainer} principalContainer`}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
              
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUMNA 1: DATOS GENERALES */}
          <div className={`${AppStyles.glassCard} overflow-visible z-50`}>
             <div className={"absolute top-[1px] left-[6px] w-[calc(100%-2px)] h-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-t-3xl"}></div>
             
             <h3 className={`${AppStyles.sectionTitle} left-[100px]`}>
                <span className={AppStyles.numberBadge}>1</span> 
                {routineIdToEdit ? "Editar Rutina" : "Nueva Rutina"}
             </h3>

            <Input 
              label="Nombre de Rutina" 
              value={nombreRutina} 
              onChange={e => setNombreRutina(e.target.value)} 
              placeholder="Ej: Hipertrofia" 
              className={AppStyles.inputDark}
              labelClassName={AppStyles.label}
            />
            
            {/* LÓGICA CORREGIDA CON ESTILO SIMPLE */}
            {(!isGeneral && !routineIdToEdit) ? (
                /* CASO: CREANDO PERSONALIZADA (Buscador) */
                <div className="relative mt-4">
                    <Input 
                        label="Asignar a Alumno" value={busqueda} 
                        onChange={e => handleSearchChange(e.target.value)} 
                        onFocus={() => busqueda && setMostrarSugerencias(true)}
                        placeholder="Buscar por nombre..." className={AppStyles.inputDark} labelClassName={AppStyles.label}
                    />
                    {mostrarSugerencias && sugerencias.length > 0 && (
                        <ul className={AppStyles.suggestionsList}>
                        {sugerencias.map((a) => (
                            <li key={a.id} onClick={() => handleSelectAlumno(a)} className={AppStyles.suggestionItem}>
                            <div className={AppStyles.avatarSmall}>{a.nombre.charAt(0)}</div>
                            <span className="text-gray-200">{a.nombre} {a.apellido}</span>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
            ) : (
                /* CASO: GENERAL O EDICIÓN (Cartel Simple) */
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-300 text-sm font-bold">
                        ℹ️ {routineIdToEdit ? "Modo Edición" : "Modo Plantilla"}
                    </p>
                    {/* Opcional: Mostrar nombre del alumno en pequeñito si estamos editando una personal */}
                    {routineIdToEdit && !isGeneral && alumnoNombreDisplay && (
                        <p className="text-gray-400 text-xs mt-1 pl-6">
                           Alumno: {alumnoNombreDisplay}
                        </p>
                    )}
                </div>
            )}

          </div>

          {/* COLUMNA 2: EJERCICIOS (Buscador corregido incluido) */}
          <div className={`${AppStyles.glassCard} overflow-visible z-50`}>
             <div className={"absolute top-[1px] left-[6px] w-[calc(100%-2px)] h-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-t-3xl"}></div>
             <h3 className={`${AppStyles.sectionTitle} left-[100px]`}>
              <span className={AppStyles.numberBadge}>2</span>
              Ejercicios
             </h3>
             
             <div className="mt-4 relative" ref={searchContainerRef}>
                <Input 
                    label="Buscar Ejercicio"
                    value={ejercicioBusqueda}
                    onChange={(e) => handleEjercicioSearchChange(e.target.value)}
                    onFocus={() => setMostrarSugerenciasEjercicios(true)}
                    placeholder="Escribe para buscar..."
                    className={AppStyles.inputDark}
                    labelClassName={AppStyles.label}
                />
                
                {mostrarSugerenciasEjercicios && (
                    <ul className={`${AppStyles.suggestionsList} max-h-60 ${AppStyles.customScrollbar}`}>
                        {ejerciciosFiltrados.length > 0 ? (
                            ejerciciosFiltrados.map((ej) => (
                                <li 
                                    key={ej.id} 
                                    className={`${AppStyles.suggestionItem} flex justify-between items-center group`}
                                >
                                    <span 
                                        className="text-gray-200 flex-1" 
                                        onClick={() => handleSelectEjercicio(ej)}
                                    >
                                        {ej.nombre}
                                    </span>
                                    {ej.urlVideo && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setPreviewUrl(ej.urlVideo); }}
                                            className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Ver demostración"
                                        >
                                            <Play size={14} className="fill-current" />
                                        </button>
                                    )}
                                </li>
                            ))
                        ) : (
                            ejercicioBusqueda !== "" && (
                                <li className="p-3 text-gray-500 text-sm text-center">No encontrado</li>
                            )
                        )}
                    </ul>
                )}
            </div>

            <div className={`grid grid-cols-2 ${tipoSerie === 'Estandar' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mt-4`}>
                <Input label="Series" type="number" value={series} onChange={handleSeriesChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} />
                {tipoSerie === 'Estandar' ? (
                    <>
                        <Input label="Reps" type="text" value={reps} onChange={handleRepsChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} placeholder="Ej: 15/12" />
                        <Input label="Peso" type="text" value={peso} onChange={handlePesoChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} placeholder="A elección" />
                    </>
                ) : (
                    <Input label="Reps Iniciales" type="text" value={repsInicial} onChange={handleRepsInicialChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} placeholder="Ej: 15" />
                )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
                <label className={AppStyles.label}>Tipo de Serie</label>
                <div className="relative group">
                    <select 
                        value={tipoSerie} 
                        onChange={(e) => setTipoSerie(e.target.value as any)} 
                        className={`${AppStyles.inputDark} text-center font-bold px-4 py-[10px] appearance-none rounded-lg border border-white/10 cursor-pointer pr-10 w-full`}
                    >
                        <option value="Estandar" className={AppStyles.darkBackgroundSelect}>Estándar</option>
                        <option value="Ascendente" className={AppStyles.darkBackgroundSelect}>Ascendente</option>
                        <option value="Descendente" className={AppStyles.darkBackgroundSelect}>Descendente</option>
                    </select>
                    
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 group-hover:text-green-400 transition-colors">
                        <ChevronDown className="w-4 h-4 fill-current" />
                    </div>
                </div>
            </div>

            {tipoSerie !== 'Estandar' && (
                <div className="mt-6 p-4 rounded-xl border border-white/5 bg-black/20 space-y-3">
                <div className="flex items-center justify-between mb-2 px-2">
                    <h4 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Detalle por Serie</h4>
                    <div className="flex items-center gap-2 w-[150px] justify-center relative">
                        {pesosArray[0]?.trim() !== "" && Number(series) > 1 && (
                            <button 
                                onClick={handleAutoFillWeights}
                                className="absolute -left-6 text-gray-400 hover:text-green-400 bg-white/5 hover:bg-green-500/10 p-1 cursor-pointer rounded transition-all"
                                title="Copiar primer peso a todos"
                            >
                                <Copy size={14} />
                            </button>
                        )}
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-center">Peso</span>
                    </div>
                </div>
                {Array(Number(series) || 1).fill("").map((_, i) => {
                    const computedReps = repsArrayCalculado[i] || "-";

                    return (
                        <div key={i} className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-lg">
                            <span className="text-blue-400 font-bold min-w-[30px]">#{i + 1}</span>
                            <span className="text-gray-300 font-medium flex-1">
                                {computedReps} reps
                            </span>
                            <div className="w-[150px]">
                                <Input 
                                    type="text" 
                                    value={pesosArray[i] || ""} 
                                    onChange={(e) => handlePesoArrayChange(i, e.target.value)} 
                                    className={`${AppStyles.inputDark} text-center font-bold`} 
                                    placeholder="A elección" 
                                />
                            </div>
                        </div>
                    );
                })}
                </div>
            )}

            <div className="pt-4 flex gap-2">
                {editIndex !== null && (
                    <Button variant="danger" onClick={cancelEditRow} className="flex-1 bg-gray-700">CANCELAR</Button>
                )}
                <Button variant="info" fullWidth onClick={handleAddExercise} className={editIndex !== null ? "flex-[2] bg-yellow-500/20 text-yellow-400" : AppStyles.btnPrimary}>
                    {editIndex !== null ? "🔄 ACTUALIZAR" : "+ AGREGAR"}
                </Button>
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <div className={AppStyles.glassCard}>
            <div className={AppStyles.sectionTitle}><h3>Resumen</h3></div>
            
            {detalles.length === 0 ? <div className="text-center py-10 text-gray-500">Sin ejercicios</div> : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm text-left">
                <thead className={AppStyles.tableHeader}>
                  <tr><th className="p-4">Ejercicio</th><th className="p-4 text-center">Series</th><th className="p-4 text-center">Reps</th><th className="p-4 text-center">Peso</th><th className="p-4 text-right">Acción</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {detalles.map((d: any, index: number) => {
                      const ejOriginal = ejercicios.find((e: any) => e.id === d.ejercicioId);
                      return (
                      <tr key={index} className={`${AppStyles.tableRow} ${editIndex === index ? 'bg-yellow-500/10' : ''}`}>
                        <td className="p-4 font-medium text-white flex items-center gap-2">
                          {d.nombreEjercicio}
                          {ejOriginal?.urlVideo && (
                              <button 
                                  onClick={() => setPreviewUrl(ejOriginal.urlVideo)}
                                  className="text-blue-400 hover:text-blue-300 bg-blue-500/10 p-1.5 rounded-full transition-colors ml-2"
                                  title="Ver video"
                              >
                                  <Play size={12} className="fill-current" />
                              </button>
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-300">{d.series}</td>
                        <td className="p-4 text-center text-gray-300">{d.repeticiones}</td>
                        <td className="p-4 text-center text-green-400">{d.peso}</td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => moveRowUp(index)} disabled={index === 0} className={`p-2 rounded transition-opacity ${index === 0 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-blue-400 hover:bg-blue-500/10'}`}>⬆️</button>
                          <button onClick={() => moveRowDown(index)} disabled={index === detalles.length - 1} className={`p-2 rounded transition-opacity ${index === detalles.length - 1 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'text-blue-400 hover:bg-blue-500/10'}`}>⬇️</button>
                          <button onClick={() => handleEditRow(index)} className="text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20 p-2 rounded transition-colors">✏️</button>
                          <button onClick={() => handleDeleteRow(index)} className="text-red-500 bg-red-500/10 hover:bg-red-500/20 p-2 rounded transition-colors">🗑️</button>
                        </td>
                      </tr>
                    )})}
                </tbody>
              </table>
            </div>
           )}

          <div className="mt-8 flex justify-end pt-6 border-t border-white/10">
            <Button variant="info" onClick={handleSubmit} size="lg" className={AppStyles.btnPrimary}>
                {routineIdToEdit ? '💾 GUARDAR CAMBIOS' : '✅ CONFIRMAR'}
            </Button>
          </div>
        </div>

      </div>

      {previewUrl && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={() => setPreviewUrl(null)}>
              <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden border border-white/20">
                  <VideoEjercicio url={previewUrl} />
              </div>
          </div>,
          document.body
      )}

    </div>
  );
};
