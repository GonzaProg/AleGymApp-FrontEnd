import { useSendRoutinePDF } from "../../Hooks/EnviarRutinaPDF/useSendRoutinePDF";
import { AppStyles } from "../../Styles/AppStyles";
import { Button } from "../../Components/UI/Button";


export const SendRoutinePDF = () => {
  const {
    busqueda,
    sugerencias,
    mostrarSugerencias,
    alumnoSeleccionado,
    rutinas,
    loading,
    sendingId,
    setMostrarSugerencias,
    handleSearchChange,
    handleSelectAlumno,
    handleSendPDF,
    clearSelection
  } = useSendRoutinePDF();

  return (
    <div className={AppStyles.principalContainer}>
      <div className="container mx-auto px-4 max-w-5xl">

        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <p className={AppStyles.subtitle}>
            Selecciona un alumno y envía su rutina directamente a WhatsApp.
          </p>
        </div>

        {/* --- BUSCADOR (Glassmorphism Neon Green) --- */}
        <div className={AppStyles.searchWrapper}>
          <div className={`${AppStyles.searchGlow} bg-gradient-to-r from-green-600 to-blue-600`}></div>

          <div className="relative">
             <div className="flex gap-2">
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => busqueda && setMostrarSugerencias(true)}
                    placeholder="🔍 Buscar alumno por nombre..."
                    className={AppStyles.searchInput}
                />
                {alumnoSeleccionado && (
                    <button 
                        onClick={clearSelection}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 rounded-xl border border-white/10 transition-colors"
                        title="Limpiar búsqueda"
                    >
                        ✕
                    </button>
                )}
             </div>

            {/* LISTA DE SUGERENCIAS */}
            {mostrarSugerencias && sugerencias.length > 0 && (
              <ul className={`absolute w-full mt-2 bg-[#1a1f2e]/95 backdrop-blur-xl border border-green-500/20 rounded-xl shadow-2xl max-h-60 z-50 ${AppStyles.customScrollbar}`}>
                {sugerencias.map((alumno) => (
                  <li
                    key={alumno.id}
                    onClick={() => handleSelectAlumno(alumno)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-green-500/20 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className={AppStyles.avatarSmall} >
                      {alumno.nombre.charAt(0)}
                    </div>
                    <span className="text-gray-200 font-medium">{alumno.nombre} {alumno.apellido}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- RESULTADOS --- */}
        {alumnoSeleccionado && (
            <div className="animate-fade-in-up mt-12 pb-20">
                <div className="flex items-center gap-3 mb-6 pl-2">
                    <h3 className="text-2xl font-bold text-white mb-6 pl-4 border-l-4 border-green-500 flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-transparent py-2 rounded-r-lg">
                        Rutinas de <span className="text-green-400">{alumnoSeleccionado.nombre}</span>
                    </h3>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        <p className="text-green-500/70 mt-2 text-sm">Cargando rutinas...</p>
                    </div>
                ) : rutinas.length === 0 ? (
                    <div className="bg-gray-800/40 backdrop-blur-md border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center">
                        <span className="text-5xl opacity-20 grayscale mb-4">📂</span>
                        <p className="text-gray-400">Este alumno no tiene rutinas asignadas.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        {rutinas.map((rutina) => (
                            <div 
                                key={rutina.id} 
                                className="w-full backdrop-blur-lg bg-gray-900/60 border border-white/10 hover:border-green-500/30 hover:bg-gray-900/80 rounded-xl shadow-md p-5 flex justify-between items-center transition-all group relative overflow-hidden"
                            >
                                {/* Decoración Lateral */}
                                <div className="absolute left-0 top-0 h-full w-1 bg-green-600 group-hover:w-2 transition-all duration-300"></div>

                                {/* Info Rutina */}
                                <div className="pl-4 w-full">
                                    <h4 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                                        {rutina.nombreRutina}
                                    </h4>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1">
                                            📅 {new Date(rutina.fechaCreacion).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            🏋️ {rutina.detalles?.length || 0} Ejercicios
                                        </span>
                                        <span className="flex items-center gap-1">
                                            👨‍🏫 {rutina.entrenador || "Profe"}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón Acción */}
                                <Button
                                    onClick={() => handleSendPDF(rutina.id, rutina.nombreRutina)}
                                    disabled={sendingId === rutina.id}
                                    className={`
                                        whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 w-full md:w-auto justify-center
                                        ${sendingId === rutina.id 
                                            ? "bg-green-900/30 text-green-600 border border-green-900/50 cursor-wait" 
                                            : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 hover:shadow-green-500/30 hover:scale-105"
                                        }
                                    `}
                                >
                                    {sendingId === rutina.id ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full"></span>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            Enviar PDF
                                        </>
                                    )}
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