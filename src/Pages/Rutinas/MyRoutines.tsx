import { useMyRoutines } from "../../Hooks/MyRoutines/useMyRoutines";
import { Navbar } from "../../Components/Navbar"; 
import { Button } from "../../Components/UI/Button";
import fondoGym from "../../assets/Fondo-MyRoutines.jpg"; 
import { AppStyles } from "../../Styles/AppStyles";
import { MyRoutinesStyles } from "../../Styles/MyRoutinesStyles";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio"; 

export const MyRoutines = () => {
  const { rutinas, loading, selectedRoutine, setSelectedRoutine, videoUrl, closeModal, closeVideo, handleOpenVideo } = useMyRoutines();

  return (
    <div className={AppStyles.pageContainer}>
      
      <div
        className={AppStyles.fixedBackground}
        style={{
          backgroundImage: `url(${fondoGym})`,
          filter: 'brightness(0.8) contrast(1.1)' 
        }}
      />

      <Navbar />

      <div className={AppStyles.contentContainer}>
        <div className="w-full max-w-6xl space-y-6">
            
          <h2 className={AppStyles.title}>
            Mis <span className={AppStyles.highlight}>Rutinas</span> 💪
          </h2>
      
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
            
            /*  GRID DE RUTINAS  */
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

      {/*  MODAL DETALLE  */}
      {selectedRoutine && (
        <div className={AppStyles.modalOverlay}>
           <div className={AppStyles.modalContent}>
              
              {/* Header Modal */}
              <div className={MyRoutinesStyles.modalHeader}>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-900"></div>
                 <div>
                    <h2 className="text-2xl font-black text-white">{selectedRoutine.nombreRutina}</h2>
                    <p className="text-gray-400 text-sm mt-1">Planificado por: <b className="text-green-400">{selectedRoutine.entrenador}</b></p>
                 </div>
                 <button onClick={closeModal} className="text-gray-400 hover:text-white text-3xl leading-none transition-colors">&times;</button>
              </div>
              
              {/* Body Modal */}
              <div className={MyRoutinesStyles.modalBody}>
                 {selectedRoutine.detalles.map((d:any, i:number) => (
                    <div key={i} className={MyRoutinesStyles.exerciseRow}>
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className={AppStyles.numberBadge}>#{i + 1}</span>
                            <h4 className="font-bold text-gray-100 text-lg">{d.ejercicio.nombre}</h4>
                          </div>
                          {d.ejercicio.urlVideo && (
                            <button onClick={() => handleOpenVideo(d.ejercicio.urlVideo)} className={MyRoutinesStyles.videoBtn}>
                              ▶ Ver Video
                            </button>
                          )}
                       </div>
                       
                       {/* Métricas */}
                       <div className="flex gap-3 text-center">
                          <div className={MyRoutinesStyles.metricBox}>
                             <p className={MyRoutinesStyles.metricLabel}>Series</p>
                             <p className={MyRoutinesStyles.metricValue}>{d.series}</p>
                          </div>
                          <div className={MyRoutinesStyles.metricBox}>
                             <p className={MyRoutinesStyles.metricLabel}>Reps</p>
                             <p className={MyRoutinesStyles.metricValue}>{d.repeticiones}</p>
                          </div>
                          <div className={`${MyRoutinesStyles.metricBox} bg-green-900/20 border-green-500/30`}>
                             <p className={`${MyRoutinesStyles.metricLabel} text-green-400`}>Peso</p>
                             <p className={`${MyRoutinesStyles.metricValue} text-green-400`}>{d.peso}<span className="text-xs ml-1">kg</span></p>
                          </div>
                       </div>
                    </div>
                 ))}
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
      
      {/*  MODAL VIDEO  */}
      {videoUrl && (
        <div className={MyRoutinesStyles.videoContainer}>
           <button onClick={closeVideo} className={MyRoutinesStyles.closeVideoBtn}>
             <span className="text-2xl font-bold">&times;</span>
           </button>
           
           <div className="w-full max-w-4xl aspect-video px-4">
             {/* 2. REEMPLAZAMOS EL IFRAME POR EL COMPONENTE */}
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