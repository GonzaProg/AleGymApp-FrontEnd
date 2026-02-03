import { useMyRoutines } from "../../Hooks/MyRoutines/useMyRoutines";
import { Navbar } from "../../Components/Navbar"; 
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-MyRoutines.jpg"; 
import { AppStyles } from "../../Styles/AppStyles";
import { MyRoutinesStyles } from "../../Styles/MyRoutinesStyles";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio"; 
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

export const MyRoutines = () => {
  const { rutinas, loading, selectedRoutine, setSelectedRoutine, videoUrl, closeModal, closeVideo, handleOpenVideo } = useMyRoutines();

  return (
    <div className={AppStyles.pageContainer}>
      
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoGym})`
        }}
      />

      <Navbar />

      <div className={AppStyles.contentContainer}>
        <div className="w-full max-w-6xl space-y-6">
            
          <div className={AppStyles.headerContainer + " mb-20"}>
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
                  <span className={AppStyles.title + " text-4xl"}>
                      Mis Rutinas
                  </span>
                  <span className="ml-3 text-white">
                      💪
                  </span>
              </h2>
          </div>
      
          {loading ? (
             <div className="text-center py-20">
                <p className="text-xl text-green-500 font-bold animate-pulse">Cargando entrenamientos...</p>
             </div>
          ) : rutinas.length === 0 ? (
            
            <div className={`${AppStyles.glassCard} p-10 text-center`}>
                <div className={AppStyles.gradientDivider}></div>
                <span className="text-5xl opacity-50 mb-4 block">📭</span>
                <p className="text-gray-300 text-lg">No tienes rutinas asignadas todavía.</p>
                <p className="text-sm text-gray-500 mt-2">Pídele a tu entrenador que te cree una.</p>
            </div>

          ) : (
            
            /* GRID DE RUTINAS  */
            <div className={MyRoutinesStyles.grid}>
              {rutinas.map((rutina) => (
                <div 
                    key={rutina.id} 
                    onClick={() => setSelectedRoutine(rutina)} 
                    className={MyRoutinesStyles.routineCard}
                >
                  <div className={AppStyles.gradientDivider}></div>

                  {/* Header Tarjeta */}
                  <div className={MyRoutinesStyles.cardHeader}>
                      <h3 className={MyRoutinesStyles.cardTitle}>{rutina.nombreRutina}</h3>
                      <p className={MyRoutinesStyles.profeTag}>
                        Profe: <span className="text-gray-300">{rutina.entrenador}</span>
                      </p>
                  </div>
                  
                  {/* Cuerpo Tarjeta */}
                  <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Ejercicios:</p>
                      {rutina.detalles && rutina.detalles.length > 0 ? (
                        <ul className={MyRoutinesStyles.exerciseList}>
                           {rutina.detalles.slice(0, 3).map((d: any, i: number) => (
                              <li key={i} className={MyRoutinesStyles.exerciseItem}>
                                <span className="font-medium">• {d.ejercicio.nombre}</span>
                                <span className="text-green-500/80 text-xs font-mono">{d.series}x{d.repeticiones}</span>
                              </li>
                           ))}
                           {rutina.detalles.length > 3 && (
                              <li className={MyRoutinesStyles.moreExercisesBadge}>
                                + {rutina.detalles.length - 3} ejercicios más...
                              </li>
                           )}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 italic">Sin ejercicios asignados.</p>
                      )}
                  </div>

                  <div className="text-center pt-2 mt-auto">
                      <span className={MyRoutinesStyles.viewDetailBtn}>
                        VER DETALLE <span className="text-lg">🔍</span>
                      </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE (ESTILO NUEVO)  */}
      {selectedRoutine && (
        <div className={AppStyles.modalOverlay} onClick={closeModal}>
           {/* Hacemos el modal más ancho (max-w-4xl) para el diseño horizontal */}
           <div className={`${AppStyles.modalContent} max-w-4xl`} onClick={(e) => e.stopPropagation()}>
              
              {/* Header Modal */}
              <div className={MyRoutinesStyles.modalHeader}>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-900"></div>
                 <div>
                    <h2 className="text-2xl font-black text-white">{selectedRoutine.nombreRutina}</h2>
                    <p className="text-gray-400 text-sm mt-1">Planificado por: <b className="text-green-400">{selectedRoutine.entrenador}</b></p>
                 </div>
                 <button onClick={closeModal} className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">&times;</button>
              </div>
              
              {/* Body Modal - Lista de Ejercicios */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                 {selectedRoutine.detalles.map((d:any, i:number) => {
                    
                    // USAMOS EL HELPER AQUÍ PARA OBTENER LA IMAGEN
                    const thumbnail = CloudinaryApi.getThumbnail(d.ejercicio.imagenUrl, d.ejercicio.urlVideo);

                    return (
                        // --- TARJETA DE EJERCICIO ---
                        <div key={i} className="bg-gray-800/50 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center md:items-stretch transition-all hover:bg-gray-800/80 group">
                            
                            {/* 1. IMAGEN (Izquierda) */}
                            <div className="w-full md:w-48 h-32 flex-shrink-0 bg-black/40 rounded-lg border border-white/5 overflow-hidden relative">
                                {thumbnail ? (
                                    <img 
                                        src={thumbnail} 
                                        alt={d.ejercicio.nombre} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                        <span className="text-3xl opacity-50">🏋️‍♂️</span>
                                        <span className="text-xs mt-1">Sin imagen</span>
                                    </div>
                                )}
                                
                                {/* Overlay para ver video si existe */}
                                {d.ejercicio.urlVideo && (
                                    <div 
                                        onClick={() => handleOpenVideo(d.ejercicio.urlVideo)}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
                                    >
                                        <span className="bg-gray-300/50 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform text-xl pl-0.5">
                                            ▶
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 2. CONTENIDO (Derecha) */}
                            <div className="flex-1 flex flex-col justify-between w-full">
                                
                                {/* Título y Badge Número */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-green-900/50 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/20">
                                                #{i + 1}
                                            </span>
                                            <h4 className="font-bold text-white text-xl">{d.ejercicio.nombre}</h4>
                                        </div>

                                        {/* OPCIONAL: Enlace al video debajo del título
                                        {d.ejercicio.urlVideo && (
                                            <p 
                                                className="text-xs text-green-400 mt-2 flex items-center gap-1 cursor-pointer hover:underline w-fit" 
                                                onClick={() => handleOpenVideo(d.ejercicio.urlVideo)}
                                            >
                                                <span>📹</span> Ver demostración
                                            </p>
                                        )}
                                        */}
                                    </div>
                                </div>

                                {/* Métricas (Cajas Negras) */}
                                <div className="grid grid-cols-3 gap-2 md:gap-4">
                                    <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Series</span>
                                        <span className="text-xl font-bold text-white">{d.series}</span>
                                    </div>
                                    <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5">
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Reps</span>
                                        <span className="text-xl font-bold text-white">{d.repeticiones}</span>
                                    </div>
                                    <div className="bg-green-900/10 rounded-lg p-2 text-center border border-green-500/20">
                                        <span className="text-xs text-green-500/70 uppercase font-bold tracking-wider block mb-1">Peso</span>
                                        <span className="text-xl font-bold text-green-400">
                                            {d.peso > 0 ? `${d.peso} kg` : '-'}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                 })}
              </div>
              
              {/* Footer Modal */}
              <div className="p-4 border-t border-white/10 bg-gray-800/50 flex justify-end">
                <Button onClick={closeModal} className={AppStyles.btnSecondary + " w-auto px-6 py-2"}>
                    Cerrar
                </Button>
              </div>
           </div>
        </div>
      )}
      
      {/* MODAL VIDEO  */}
      {videoUrl && (
        <div className={MyRoutinesStyles.videoContainer} onClick={closeVideo}>
           <button onClick={closeVideo} className={MyRoutinesStyles.closeVideoBtn}>
             <span className="text-2xl font-bold">&times;</span>
           </button>
           
           <div className="w-full max-w-4xl aspect-video px-4" onClick={(e) => e.stopPropagation()}>
             <VideoEjercicio url={videoUrl} />
           </div>
           
           <p className="text-gray-500 mt-6 text-sm animate-pulse">
              Toca la X para volver
           </p>
        </div>
      )}

    </div>
  );
};