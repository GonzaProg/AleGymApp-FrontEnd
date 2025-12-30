import { useDeleteRoutine } from "../../Hooks/DeleteRoutine/useDeleteRoutine";
import { Navbar } from "../../Components/Navbar"; 
import { Input } from "../../Components/UI/Input";
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-DeleteRoutine.png"; 

export const DeleteRoutine = () => {
  const { busqueda, sugerencias, mostrarSugerencias, alumnoSeleccionado, rutinas, setMostrarSugerencias, handleSearchChange, handleSelectAlumno, handleDelete } = useDeleteRoutine();

  // Clases comunes para estilo oscuro
  const darkGlassBase = "w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-6";
  const darkInputClass = "bg-black/30 border-white/10 text-white focus:border-red-500/50 p-3";
  const darkLabelClass = "text-gray-400 text-xs uppercase font-bold tracking-wider";

  return (
    <div className="relative min-h-screen font-sans bg-gray-900 text-gray-200">
      
      {/* --- FONDO FIJO --- */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondoGym})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.5) contrast(1.1) hue-rotate(-10deg)' // Un toque más rojizo/oscuro para esta sección
        }}
      />

      <Navbar />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className="relative z-10 pt-28 pb-10 px-4 w-full flex justify-center">
        <div className="w-full max-w-4xl space-y-8">
            
          {/* Título Principal */}
          <h2 className="text-4xl font-black text-red-500/85 mb-8 tracking-tight drop-shadow-lg flex items-center gap-3">
            <span>🗑️</span> Borrar Rutinas
          </h2>

          {/* --- SECCIÓN BUSCADOR --- */}
          <div className={`${darkGlassBase} overflow-visible z-20 relative`}>
             <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                🔍 Buscar Alumno
             </h3>
            <div className="relative">
              <Input 
                label="Nombre del Alumno" 
                value={busqueda} 
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => busqueda && setMostrarSugerencias(true)}
                placeholder="Escribe para buscar..."
                className={darkInputClass}
                labelClassName={darkLabelClass}
              />
              
              {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="absolute z-30 w-full backdrop-blur-xl bg-gray-950/95 border border-white/10 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto thin-scrollbar">
                  {sugerencias.map((alumno) => (
                    <li key={alumno.id} onClick={() => handleSelectAlumno(alumno)} className="p-3 hover:bg-red-500/20 cursor-pointer border-b border-white/5 transition-colors flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-red-400 border border-white/10 group-hover:border-red-500/50">
                        {alumno.nombre.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-200 group-hover:text-white">{alumno.nombre} {alumno.apellido}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* --- RESULTADOS DEL ALUMNO --- */}
          {alumnoSeleccionado && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-white pl-2 border-l-4 border-red-500 flex items-center gap-2">
                 Rutinas de <span className="text-red-400">{alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}</span>
              </h3>
              
              {rutinas.length === 0 ? (
                 <div className={`${darkGlassBase} text-center py-8 text-gray-400 flex flex-col items-center`}>
                    <span className="text-4xl opacity-50 mb-2">📂</span>
                    <p className="italic">Este alumno no tiene rutinas asignadas.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {rutinas.map(rutina => (
                    // --- TARJETA DE RUTINA INDIVIDUAL ---
                    <div key={rutina.id} className="w-full backdrop-blur-lg bg-gray-900/60 border border-white/10 hover:bg-gray-900/80 rounded-xl shadow-md p-5 flex justify-between items-center transition-all group relative overflow-hidden">
                      
                      {/* Borde lateral de color */}
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
                        className="bg-red-600/80 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 border border-red-500/20 font-bold tracking-wide py-2 px-4 rounded-lg flex items-center gap-2 transition-all hover:scale-105 shrink-0 ml-4"
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