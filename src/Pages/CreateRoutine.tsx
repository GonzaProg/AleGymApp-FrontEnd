import { useCreateRoutine } from "../Hooks/CreateRoutine/useCreateRoutine";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";

export const CreateRoutine = () => {
  const {
    ejercicios, busqueda, sugerencias, mostrarSugerencias, nombreRutina, detalles,
    ejercicioId, series, reps, peso,
    setNombreRutina, setEjercicioId, setMostrarSugerencias, setDetalles,
    handleSearchChange, handleSelectAlumno, handleSeriesChange, handleRepsChange, handlePesoChange, handleAddExercise, handleSubmit
  } = useCreateRoutine();

  return (
    <PageLayout>
      <h2 className="text-2xl font-bold text-green-800 mb-6">Nueva Rutina</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUMNA 1: Datos y Buscador */}
        <Card title="1. Datos Generales">
          <Input label="Nombre de Rutina" value={nombreRutina} onChange={e => setNombreRutina(e.target.value)} placeholder="Ej: Lunes: Pecho, Triceps, Hombros" />
          
          <div className="relative">
            <Input 
              label="Buscar Alumno" 
              value={busqueda} 
              onChange={e => handleSearchChange(e.target.value)} 
              onFocus={() => busqueda && setMostrarSugerencias(true)}
              placeholder="Escribe el nombre..."
            />
            {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg -mt-3 max-h-48 overflow-y-auto">
                {sugerencias.map((alumno) => (
                  <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className="p-2 hover:bg-green-100 cursor-pointer border-b">
                    <span className="font-bold">{alumno.nombre} {alumno.apellido}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* COLUMNA 2: Formulario Ejercicios */}
        <Card title="2. Agregar Ejercicios">
          <Input as="select" label="Ejercicio" value={ejercicioId} onChange={e => setEjercicioId(e.target.value)}>
             <option value="">-- Seleccionar --</option>
             {ejercicios.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
          </Input>

          <div className="grid grid-cols-3 gap-2">
            <Input label="Series" type="number" min="1" value={series} onChange={handleSeriesChange} />
            <Input label="Reps" type="number" min="1" value={reps} onChange={handleRepsChange} />
            <Input label="Peso (kg)" type="number" step="0.1" value={peso} onChange={handlePesoChange} />
          </div>

          <Button variant="info" fullWidth onClick={handleAddExercise}>+ Agregar a la lista</Button>
        </Card>
      </div>

      {/* RESUMEN */}
      <Card className="mt-8" title="Resumen de Rutina">
        {detalles.length === 0 ? (
          <p className="text-gray-400 italic">No has agregado ejercicios aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr><th className="p-2">Ejercicio</th><th className="p-2">Series</th><th className="p-2">Reps</th><th className="p-2">Peso</th><th className="p-2">Acción</th></tr>
              </thead>
              <tbody>
                {detalles.map((d, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{d.nombreEjercicio}</td>
                    <td className="p-2">{d.series}</td>
                    <td className="p-2">{d.repeticiones}</td>
                    <td className="p-2">{d.peso} kg</td>
                    <td className="p-2">
                      <button onClick={() => setDetalles(detalles.filter((_, i) => i !== index))} className="text-red-500 font-bold">X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex justify-end">
           <Button onClick={handleSubmit} size="lg">CONFIRMAR RUTINA</Button>
        </div>
      </Card>
    </PageLayout>
  );
};