import { useMyRoutines } from "../../Hooks/MyRoutines/useMyRoutines";
import { Navbar } from "../../Components/Navbar"; 
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-MyRoutines.png"; 

export const MyRoutines = () => {
  const { rutinas, loading, selectedRoutine, setSelectedRoutine, videoUrl, closeModal, closeVideo, handleOpenVideo } = useMyRoutines();

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
          filter: 'brightness(0.4) contrast(1.1)' 
        }}
      />

      <Navbar />

      {/* --- CONTENEDOR PRINCIPAL --- */}
      <div className="relative z-10 pt-28 pb-10 px-4 w-full flex justify-center">
        <div className="w-full max-w-6xl space-y-6">
            
          {/* Título Principal */}
          <h2 className="text-4xl font-black text-white mb-8 tracking-tight drop-shadow-lg">
            Mis <span className="text-green-500">Rutinas</span> 💪
          </h2>
      
          {loading ? (
             <div className="text-center py-20">
                <p className="text-xl text-green-500 font-bold animate-pulse">Cargando entrenamientos...</p>
             </div>
          ) : rutinas.length === 0 ? (
            
            /* --- ESTADO VACÍO CON ESTILO GLASS --- */
            <div className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>
                <span className="text-5xl opacity-50 mb-4 block">📭</span>
                <p className="text-gray-300 text-lg">No tienes rutinas asignadas todavía.</p>
                <p className="text-sm text-gray-500 mt-2">Pídele a tu entrenador que te cree una.</p>
            </div>

          ) : (
            
            /* --- GRID DE RUTINAS --- */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rutinas.map((rutina) => (
                <div 
                    key={rutina.id} 
                    onClick={() => setSelectedRoutine(rutina)} 
                    className="w-full backdrop-blur-xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-xl p-6 relative overflow-hidden group hover:border-green-500/50 hover:bg-gray-800/90 transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  {/* Banner decorativo superior */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>

                  {/* Header de la Tarjeta */}
                  <div className="border-b border-white/10 pb-3 mb-4">
                     <h3 className="text-2xl font-bold text-white truncate">{rutina.nombreRutina}</h3>
                     <p className="text-sm text-green-400 font-bold tracking-wider mt-1">
                        Profe: <span className="text-gray-300">{rutina.entrenador}</span>
                     </p>
                  </div>
                  
                  {/* Cuerpo de la Tarjeta */}
                  <div className="mb-4">
                     <p className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Ejercicios:</p>
                     {rutina.detalles && rutina.detalles.length > 0 ? (
                        <ul className="space-y-2">
                           {rutina.detalles.slice(0, 3).map((d: any, i: number) => (
                              <li key={i} className="text-base flex justify-between text-gray-300 border-b border-white/5 pb-1 last:border-0">
                                <span className="font-medium">• {d.ejercicio.nombre}</span>
                                <span className="text-green-500/80 text-xs font-mono">{d.series}x{d.repeticiones}</span>
                              </li>
                           ))}
                           {rutina.detalles.length > 3 && (
                              <li className="text-xs text-green-500 font-bold mt-3 text-center bg-green-500/10 py-1 rounded">
                                + {rutina.detalles.length - 3} ejercicios más...
                              </li>
                           )}
                        </ul>
                     ) : (
                        <p className="text-xs text-gray-500 italic">Sin ejercicios asignados.</p>
                     )}
                  </div>

                  <div className="text-center pt-2 mt-auto">
                      <span className="text-white text-xs font-bold group-hover:text-green-400 transition-colors flex items-center justify-center gap-1">
                        VER DETALLE <span className="text-lg">🔍</span>
                      </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL DETALLE --- */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
           <div className="bg-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh] overflow-hidden">
              
              {/* Header Modal */}
              <div className="bg-gray-800/50 p-6 border-b border-white/10 flex justify-between items-start relative">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-900"></div>
                 <div>
                    <h2 className="text-2xl font-black text-white">{selectedRoutine.nombreRutina}</h2>
                    <p className="text-gray-400 text-sm mt-1">Planificado por: <b className="text-green-400">{selectedRoutine.entrenador}</b></p>
                 </div>
                 <button onClick={closeModal} className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">&times;</button>
              </div>
              
              {/* Body Modal */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-gray-900 custom-scrollbar">
                 {selectedRoutine.detalles.map((d:any, i:number) => (
                    <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-white/10 transition-colors">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="bg-green-600/20 text-green-500 text-xs font-bold px-2 py-1 rounded border border-green-500/20">#{i + 1}</span>
                            <h4 className="font-bold text-gray-100 text-lg">{d.ejercicio.nombre}</h4>
                          </div>
                          {d.ejercicio.urlVideo && (
                            <button onClick={() => handleOpenVideo(d.ejercicio.urlVideo)} className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:text-blue-300 mt-2 bg-blue-500/10 px-3 py-1 rounded transition-colors">
                              ▶ Ver Video
                            </button>
                          )}
                       </div>
                       
                       {/* Métricas del ejercicio */}
                       <div className="flex gap-3 text-center">
                          <div className="bg-black/40 p-2 rounded-lg w-16 border border-white/5">
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Series</p>
                              <p className="font-bold text-white text-lg">{d.series}</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded-lg w-16 border border-white/5">
                              <p className="text-[10px] text-gray-500 font-bold uppercase">Reps</p>
                              <p className="font-bold text-white text-lg">{d.repeticiones}</p>
                          </div>
                          <div className="bg-green-900/20 p-2 rounded-lg w-20 border border-green-500/30">
                              <p className="text-[10px] text-green-400 font-bold uppercase">Peso</p>
                              <p className="font-bold text-green-400 text-lg">{d.peso}<span className="text-xs ml-1">kg</span></p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
              
              {/* Footer Modal */}
              <div className="p-4 border-t border-white/10 bg-gray-800/50 flex justify-end">
                <Button 
                    onClick={closeModal} 
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold border border-white/10"
                >
                    Cerrar
                </Button>
              </div>
           </div>
        </div>
      )}
      
      {/* --- MODAL VIDEO --- */}
      {videoUrl && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center animate-fade-in backdrop-blur-xl">
           <button onClick={closeVideo} className="absolute top-5 right-5 text-white bg-white/10 hover:bg-red-500/80 rounded-full w-12 h-12 flex items-center justify-center transition border border-white/10">
             <span className="text-2xl font-bold">&times;</span>
           </button>
           <div className="w-full max-w-5xl aspect-video px-4">
             <iframe src={videoUrl} title="Video" className="w-full h-full rounded-2xl shadow-2xl border border-white/10" allow="autoplay; encrypted-media" allowFullScreen></iframe>
           </div>
           <p className="text-gray-500 mt-6 text-sm animate-pulse">Toca la X para volver</p>
        </div>
      )}

    </div>
  );
};