import { useCreateRoutine } from "../../Hooks/CreateRoutine/useCreateRoutine";
import { Navbar } from "../../Components/Navbar"; 
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-CreateRoutine.jpg"; 
import { AppStyles } from "../../Styles/AppStyles";

export const CreateRoutine = () => {
  const {
    ejercicios, busqueda, sugerencias, mostrarSugerencias, nombreRutina, detalles,
    ejercicioId, series, reps, peso,
    setNombreRutina, setEjercicioId, setMostrarSugerencias, setDetalles,
    handleSearchChange, handleSelectAlumno, handleSeriesChange, handleRepsChange, handlePesoChange, handleAddExercise, handleSubmit
  } = useCreateRoutine();

  return (
    <div className={AppStyles.pageContainer}>
      
      {/* FONDO */}
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoGym})`
        }}
      />

      <Navbar />

      <div className={AppStyles.contentContainer}>
        <div className="w-full max-w-5xl space-y-6">
            
          <h2 className={`${AppStyles.title} text-center`}>
            Nueva Rutina
          </h2>
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- COLUMNA 1: DATOS --- */}
            <div className={AppStyles.glassCard}>
               <div className={AppStyles.gradientDivider}></div>
               
               <h3 className={AppStyles.sectionTitle}>
                  <span className={AppStyles.numberBadge}>1</span> Datos Generales
               </h3>

              <Input 
                label="Nombre de Rutina" 
                value={nombreRutina} 
                onChange={e => setNombreRutina(e.target.value)} 
                placeholder="Ej: Lunes: Pecho, Triceps..." 
                className={AppStyles.inputDark}
                labelClassName={AppStyles.label}
              />
              
              <div className="relative mt-4">
                <Input 
                  label="Buscar Alumno" 
                  value={busqueda} 
                  onChange={e => handleSearchChange(e.target.value)} 
                  onFocus={() => busqueda && setMostrarSugerencias(true)}
                  placeholder="Escribe el nombre..."
                  className={AppStyles.inputDark}
                  labelClassName={AppStyles.label}
                />
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <ul className={AppStyles.suggestionsList}>
                    {sugerencias.map((alumno) => (
                      <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className={AppStyles.suggestionItem}>
                        <div className={AppStyles.avatarSmall}>
                          {alumno.nombre.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-200 group-hover:text-white">{alumno.nombre} {alumno.apellido}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* --- COLUMNA 2: AGREGAR EJERCICIOS --- */}
            <div className={AppStyles.glassCard}>
              <div className={AppStyles.gradientDivider}></div>

              <h3 className={AppStyles.sectionTitle}>
                  <span className={AppStyles.numberBadge}>2</span> Agregar Ejercicios
              </h3>
              
              <Input 
                as="select" 
                label="Seleccionar Ejercicio" 
                value={ejercicioId} 
                onChange={e => setEjercicioId(e.target.value)}
                className={`${AppStyles.inputDark} appearance-none`}
                labelClassName={AppStyles.label}
              >
                  <option value="" className="text-gray-800">-- Elige un ejercicio --</option>
                  {ejercicios.map(ej => <option key={ej.id} value={ej.id} className="text-gray-800">{ej.nombre}</option>)}
              </Input>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <Input label="Series" type="number" min="1" value={series} onChange={handleSeriesChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} />
                <Input label="Reps" type="number" min="1" value={reps} onChange={handleRepsChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} />
                <Input label="Peso (kg)" type="number" step="0.5" value={peso} onChange={handlePesoChange} className={`${AppStyles.inputDark} text-center font-bold`} labelClassName={AppStyles.label} placeholder="0" />
              </div>

              <div className="pt-4">
                <Button variant="info" fullWidth onClick={handleAddExercise} className={AppStyles.btnPrimary}>
                  + AGREGAR A LA LISTA
                </Button>
              </div>
            </div>
          </div>

          {/* --- RESUMEN --- */}
          <div className={AppStyles.glassCard}>
             <div className={AppStyles.gradientDivider}></div>

             <div className={AppStyles.sectionTitle}>
                <span className="text-2xl">📋</span>
                <h3 className="text-xl font-bold text-white">Resumen de Rutina</h3>
             </div>

            {detalles.length === 0 ? (
              <div className="text-center py-12 text-gray-500 flex flex-col items-center bg-black/20 rounded-xl border border-white/5 dashed">
                <span className="text-4xl opacity-50 mb-2">🏋️‍♂️</span>
                <p className="italic">Aún no has agregado ejercicios a esta rutina.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm text-left">
                  <thead className={AppStyles.tableHeader}>
                    <tr>
                      <th className="p-4">Ejercicio</th>
                      <th className="p-4 text-center">Series</th>
                      <th className="p-4 text-center">Reps</th>
                      <th className="p-4 text-center">Peso</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {detalles.map((d: any, index: number) => (
                      <tr key={index} className={AppStyles.tableRow}>
                        <td className="p-4 font-medium text-white">{d.nombreEjercicio}</td>
                        <td className="p-4 text-center text-gray-300 font-bold">{d.series}</td>
                        <td className="p-4 text-center text-gray-300 font-bold">{d.repeticiones}</td>
                        <td className="p-4 text-center text-green-400 font-bold">{d.peso > 0 ? `${d.peso} kg` : '-'}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setDetalles(detalles.filter((_, i) => i !== index))} 
                            className="text-red-500/70 hover:text-red-400 bg-red-600/50 hover:bg-red-500/20 p-2 rounded-lg transition-all group"
                            title="Eliminar ejercicio"
                          >
                            🗑️ <span className="hidden group-hover:inline text-xs ml-1">Borrar</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-8 flex justify-end border-t border-white/10 pt-6">
              <Button 
                variant="info"
                onClick={handleSubmit} 
                size="lg" 
                className={`${AppStyles.btnPrimary} px-8 py-4 text-lg ${detalles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={detalles.length === 0}
              >
                 ✅ CONFIRMAR RUTINA
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};