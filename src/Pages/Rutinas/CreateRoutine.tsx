import { useCreateRoutine } from "../../Hooks/CreateRoutine/useCreateRoutine";
import { Navbar } from "../../Components/Navbar"; 
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-CreateRoutine.png"; 

export const CreateRoutine = () => {
  const {
    ejercicios, busqueda, sugerencias, mostrarSugerencias, nombreRutina, detalles,
    ejercicioId, series, reps, peso,
    setNombreRutina, setEjercicioId, setMostrarSugerencias, setDetalles,
    handleSearchChange, handleSelectAlumno, handleSeriesChange, handleRepsChange, handlePesoChange, handleAddExercise, handleSubmit
  } = useCreateRoutine();

  // Clases comunes para inputs en modo oscuro
  const darkInputClass = "bg-black/30 border-white/10 text-white focus:border-green-500/50 p-3";
  const darkLabelClass = "text-gray-400 text-xs uppercase font-bold tracking-wider";

  return (
    <div className="relative min-h-screen font-sans bg-gray-900 text-gray-200">
      
      {/* --- FONDO FIJO ESTILO PERFIL --- */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondoGym})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.3) contrast(1.1)' 
        }}
      />

      <Navbar />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className="relative z-10 pt-28 pb-10 px-4 w-full flex justify-center">
        <div className="w-full max-w-5xl space-y-6">
            
          {/* Título Principal */}
          <h2 className="text-4xl font-black text-white mb-8 tracking-tight drop-shadow-lg">
            Nueva <span className="text-green-500">Rutina</span>
          </h2>
      
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- COLUMNA 1: DATOS --- */}
            <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden">
               {/* Banner decorativo superior */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>
              
               <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span className="bg-green-600/20 text-green-500 py-1 px-3 rounded-lg text-sm">1</span> Datos Generales
               </h3>

              <Input 
                label="Nombre de Rutina" 
                value={nombreRutina} 
                onChange={e => setNombreRutina(e.target.value)} 
                placeholder="Ej: Lunes: Pecho, Triceps..." 
                className={darkInputClass}
                labelClassName={darkLabelClass}
              />
              
              <div className="relative">
                <Input 
                  label="Buscar Alumno" 
                  value={busqueda} 
                  onChange={e => handleSearchChange(e.target.value)} 
                  onFocus={() => busqueda && setMostrarSugerencias(true)}
                  placeholder="Escribe el nombre..."
                  className={darkInputClass}
                  labelClassName={darkLabelClass}
                />
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <ul className="absolute z-20 w-full backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-xl shadow-2xl mt-1 max-h-60 overflow-y-auto overflow-x-hidden thin-scrollbar">
                    {sugerencias.map((alumno) => (
                      <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className="p-3 hover:bg-green-600/20 cursor-pointer border-b border-white/5 transition-colors flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white border border-white/10 group-hover:border-green-500/50">
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
            <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden">
              {/* Banner decorativo superior */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>

              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
                  <span className="bg-green-600/20 text-green-500 py-1 px-3 rounded-lg text-sm">2</span> Agregar Ejercicios
              </h3>
              
              <Input 
                as="select" 
                label="Seleccionar Ejercicio" 
                value={ejercicioId} 
                onChange={e => setEjercicioId(e.target.value)}
                className={`${darkInputClass} appearance-none`} // appearance-none ayuda a estilos de select en algunos browsers
                labelClassName={darkLabelClass}
              >
                  <option value="" className="text-gray-800">-- Elige un ejercicio --</option>
                  {ejercicios.map(ej => <option key={ej.id} value={ej.id} className="text-gray-800">{ej.nombre}</option>)}
              </Input>

              <div className="grid grid-cols-3 gap-4">
                <Input label="Series" type="number" min="1" value={series} onChange={handleSeriesChange} className={`${darkInputClass} text-center font-bold`} labelClassName={darkLabelClass} />
                <Input label="Reps" type="number" min="1" value={reps} onChange={handleRepsChange} className={`${darkInputClass} text-center font-bold`} labelClassName={darkLabelClass} />
                <Input label="Peso (kg)" type="number" step="0.5" value={peso} onChange={handlePesoChange} className={`${darkInputClass} text-center font-bold`} labelClassName={darkLabelClass} placeholder="0" />
              </div>

              <div className="pt-2">
                <Button variant="info" fullWidth onClick={handleAddExercise} className="bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/30 border border-green-500/20 font-bold tracking-wide py-3 rounded-xl">
                  + AGREGAR A LA LISTA
                </Button>
              </div>
            </div>
          </div>

          {/* --- RESUMEN --- */}
          <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden">
             {/* Banner decorativo superior */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>

             <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
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
                {/* TABLA OSCURA */}
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-black/40 text-gray-300 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Ejercicio</th>
                      <th className="p-4 text-center">Series</th>
                      <th className="p-4 text-center">Reps</th>
                      <th className="p-4 text-center">Peso</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {detalles.map((d, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium text-white">{d.nombreEjercicio}</td>
                        <td className="p-4 text-center text-gray-300 font-bold">{d.series}</td>
                        <td className="p-4 text-center text-gray-300 font-bold">{d.repeticiones}</td>
                        <td className="p-4 text-center text-green-400 font-bold">{d.peso > 0 ? `${d.peso} kg` : '-'}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setDetalles(detalles.filter((_, i) => i !== index))} 
                            className="text-red-500/70 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-all group"
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
                onClick={handleSubmit} 
                size="lg" 
                className={`bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-green-900/20 border border-green-500/20 tracking-wider text-lg transition-all hover:scale-105 ${detalles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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