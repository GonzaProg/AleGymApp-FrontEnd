import { useDeleteRoutine } from "../../Hooks/DeleteRoutine/useDeleteRoutine";
import { Navbar } from "../../Components/Navbar"; 
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-DeleteRoutine.png"; 
import { AppStyles } from "../../Styles/AppStyles";
import { DeleteRoutineStyles } from "../../Styles/DeleteRoutineStyles";

export const DeleteRoutine = () => {
  const { busqueda, sugerencias, mostrarSugerencias, alumnoSeleccionado, rutinas, setMostrarSugerencias, handleSearchChange, handleSelectAlumno, handleDelete } = useDeleteRoutine();

  return (
    <div className={AppStyles.pageContainer}>
      
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoGym})`,
          filter: 'brightness(0.7) contrast(1.1) hue-rotate(-10deg)'
        }}
      />

      <Navbar />

      <div className={AppStyles.contentContainer}>
        <div className="w-full max-w-4xl space-y-8">
          <h2 className={DeleteRoutineStyles.redTitle}>
            <span>🗑️</span> Borrar Rutinas
          </h2>

          {/* --- SECCIÓN BUSCADOR --- */}
          <div className={`${AppStyles.glassCard} overflow-visible z-20`}>
             <h3 className={AppStyles.sectionTitle}>
                🔍 Buscar Alumno
             </h3>
            <div className="relative">
              <Input 
                label="Nombre del Alumno" 
                value={busqueda} 
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => busqueda && setMostrarSugerencias(true)}
                placeholder="Escribe para buscar..."
                className={DeleteRoutineStyles.redInputClass} // Usamos la variante roja
                labelClassName={AppStyles.label}
              />
              
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className={AppStyles.suggestionsList}>
                  {sugerencias.map((alumno) => (
                    <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className={`${AppStyles.suggestionItem} hover:bg-red-500/20`}>
                      <div className={`${AppStyles.avatarSmall} bg-gray-800 text-red-400 group-hover:border-red-500/50`}>
                        {alumno.nombre.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-200 group-hover:text-white">{alumno.nombre} {alumno.apellido}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* --- RESULTADOS --- */}
          {alumnoSeleccionado && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-white pl-2 border-l-4 border-red-500 flex items-center gap-2">
                 Rutinas de <span className="text-red-400">{alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</span>
              </h3>
              
              {rutinas.length === 0 ? (
                 <div className={`${AppStyles.glassCard} text-center py-8 text-gray-400 flex flex-col items-center`}>
                    <span className="text-4xl opacity-50 mb-2">📂</span>
                    <p className="italic">Este alumno no tiene rutinas asignadas.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {rutinas.map(rutina => (
                    <div key={rutina.id} className={DeleteRoutineStyles.itemRedList}>
                      
                      <div className="absolute left-0 top-0 h-full w-1 bg-red-500/50 group-hover:bg-red-500 transition-colors"></div>
                      
                      <div className="pl-4">
                        <h4 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors">{rutina.nombreRutina}</h4>
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                           📅 Creada el: {new Date(rutina.fechaCreacion).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Button 
                        variant="danger" 
                        onClick={() => handleDelete(rutina.id)}
                        className={AppStyles.btnDanger}
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};