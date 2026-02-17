import { useCreateRoutine } from "../../Hooks/Rutinas/useCreateRoutine";
import { Input, Button, ExerciseSearch } from "../../Components/UI";
import { AppStyles } from "../../Styles/AppStyles";

// Define tipos para las props
interface CreateRoutineProps {
    isGeneral?: boolean;
    routineIdToEdit?: number | null;
}

export const CreateRoutine = ({ isGeneral = false, routineIdToEdit = null }: CreateRoutineProps) => {
  const {
    ejercicios, busqueda, sugerencias, mostrarSugerencias, nombreRutina, detalles,
    ejercicioId, series, reps, peso,
    setNombreRutina, setEjercicioId, setMostrarSugerencias,
    handleSearchChange, handleSelectAlumno, handleSeriesChange, handleRepsChange, handlePesoChange, handleAddExercise, handleSubmit,
    // Nuevos del hook
    editIndex, handleEditRow, cancelEditRow, handleDeleteRow
  } = useCreateRoutine(isGeneral, routineIdToEdit); 

  return (
    <div className={AppStyles.principalContainer}>
      <div className="w-full max-w-5xl mx-auto space-y-6">
              
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* COLUMNA 1 */}
          <div className={`${AppStyles.glassCard} overflow-visible z-50`}>
             <div className={"absolute top-[1px] left-[6px] w-[calc(100%-2px)] h-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-t-3xl"}></div>
             
             <h3 className={`${AppStyles.sectionTitle} left-[100px]`}>
                <span className={AppStyles.numberBadge}>1</span> 
                {routineIdToEdit ? "Editar Datos" : "Datos Generales"}
             </h3>

            <Input 
              label="Nombre de Rutina" 
              value={nombreRutina} 
              onChange={e => setNombreRutina(e.target.value)} 
              placeholder="Ej: Hipertrofia" 
              className={AppStyles.inputDark}
              labelClassName={AppStyles.label}
            />
            
            {!isGeneral ? (
                <div className="relative mt-4">
                  <Input 
                    label="Buscar Alumno" value={busqueda} 
                    onChange={e => handleSearchChange(e.target.value)} 
                    onFocus={() => busqueda && setMostrarSugerencias(true)}
                    placeholder="Nombre..." className={AppStyles.inputDark} labelClassName={AppStyles.label}
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
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-blue-300 text-sm font-bold">ℹ️ {routineIdToEdit ? "Modo Edición" : "Modo Plantilla"}</p>
                </div>
            )}
          </div>

          {/* COLUMNA 2 */}
          <div className={`${AppStyles.glassCard} overflow-visible z-50`}>
            <div className={AppStyles.gradientDivider}></div>
            <h3 className={AppStyles.sectionTitle}><span className={AppStyles.numberBadge}>2</span> Ejercicios</h3>
            
            <div className="mt-4">
              <label className={AppStyles.label}>Ejercicio</label>
              <ExerciseSearch
                exercises={ejercicios}
                value={ejercicioId}
                onChange={setEjercicioId}
                placeholder="Seleccionar ejercicio..."
                className={AppStyles.inputDark}
                labelClassName={AppStyles.label}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <Input label="Series" type="number" value={series} onChange={handleSeriesChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} />
              <Input label="Reps" type="number" value={reps} onChange={handleRepsChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} />
              <Input label="Peso (kg)" type="text" value={peso} onChange={handlePesoChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} placeholder="A elección" />
            </div>

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
                  {detalles.map((d: any, index: number) => (
                    <tr key={index} className={`${AppStyles.tableRow} ${editIndex === index ? 'bg-yellow-500/10' : ''}`}>
                      <td className="p-4 font-medium text-white">{d.nombreEjercicio}</td>
                      <td className="p-4 text-center text-gray-300">{d.series}</td>
                      <td className="p-4 text-center text-gray-300">{d.repeticiones}</td>
                      <td className="p-4 text-center text-green-400">{d.peso}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleEditRow(index)} className="text-yellow-500 bg-yellow-500/10 p-2 rounded">✏️</button>
                        <button onClick={() => handleDeleteRow(index)} className="text-red-500 bg-red-500/10 p-2 rounded">🗑️</button>
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
};