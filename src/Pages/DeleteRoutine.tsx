import { useDeleteRoutine } from "../Hooks/DeleteRoutine/useDeleteRoutine";
import { PageLayout } from "../Components/UI/PageLayout";
import { Card } from "../Components/UI/Card";
import { Input } from "../Components/UI/Input";
import { Button } from "../Components/UI/Button";

export const DeleteRoutine = () => {
  const { busqueda, sugerencias, mostrarSugerencias, alumnoSeleccionado, rutinas, setMostrarSugerencias, handleSearchChange, handleSelectAlumno, handleDelete } = useDeleteRoutine();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-2">🗑️ Gestión de Rutinas</h2>

        <Card className="mb-8 overflow-visible"> {/* overflow-visible para que se vea el dropdown */}
          <div className="relative">
            <Input 
              label="Buscar Alumno" 
              value={busqueda} 
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => busqueda && setMostrarSugerencias(true)}
              placeholder="Nombre del alumno..."
            />
             {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {sugerencias.map((alumno) => (
                  <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className="p-3 hover:bg-gray-100 cursor-pointer border-b">
                    <span className="font-bold">{alumno.nombre} {alumno.apellido}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {alumnoSeleccionado && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rutinas de {alumnoSeleccionado.nombre}</h3>
            {rutinas.length === 0 ? (
               <Card><p className="text-gray-500 italic">Sin rutinas asignadas.</p></Card>
            ) : (
              <div className="space-y-4">
                {rutinas.map(rutina => (
                  <Card key={rutina.id} className="border-l-4 border-green-500 flex justify-between items-center flex-row">
                    <div>
                      <h4 className="text-lg font-bold">{rutina.nombreRutina}</h4>
                      <p className="text-xs text-gray-500">{new Date(rutina.fechaCreacion).toLocaleDateString()}</p>
                    </div>
                    <Button variant="danger" onClick={() => handleDelete(rutina.id)}>🗑️ Eliminar</Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};