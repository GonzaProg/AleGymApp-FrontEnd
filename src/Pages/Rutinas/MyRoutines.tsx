import { useState, useEffect } from "react";
import { useMyRoutines } from "../../Hooks/Rutinas/useMyRoutines";
import { AppStyles } from "../../Styles/AppStyles";
import { MyRoutinesStyles } from "../../Styles/MyRoutinesStyles";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio"; 
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

import { createPortal } from "react-dom";
import { Inbox, CloudDownload, CheckCircle, Download, Search, Dumbbell, ArrowLeft } from "lucide-react";

export const MyRoutines = () => {
  
  const { 
      rutinas, loading, selectedRoutine, setSelectedRoutine, 
      videoUrl, closeModal, closeVideo, handleOpenVideo,
      handleDownload, downloadingId, downloadProgress, downloadedIds
  } = useMyRoutines();

  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gymmate_checked_exercises');
      if (stored) {
        const parsed = JSON.parse(stored);
        const today = new Date().toDateString();
        if (parsed.date === today) {
          setCheckedExercises(parsed.data || {});
        } else {
          localStorage.removeItem('gymmate_checked_exercises');
        }
      }
    } catch (e) {
      console.error(e);
      localStorage.removeItem('gymmate_checked_exercises');
    }
  }, []);

  const toggleExerciseCheck = (routineId: string | number, exerciseId: string | number | undefined, index: number) => {
    const key = `${routineId}-${exerciseId || index}`;
    setCheckedExercises(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      const today = new Date().toDateString();
      localStorage.setItem('gymmate_checked_exercises', JSON.stringify({
        date: today,
        data: newState
      }));
      return newState;
    });
  };

  if (selectedRoutine) {
    return (
      <div className="mt-20 w-full min-h-full bg-[#1a1225] flex flex-col pt-safe animate-fade-in-up">
        {/* ENCABEZADO FIJO */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 px-4 py-4 shrink-0 shadow-lg mt-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-900"></div>
            <div className="flex items-center gap-4 mt-2 mb-2">
                <button 
                  onClick={closeModal} 
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-colors shadow-sm"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 truncate">
                        {selectedRoutine.nombreRutina}
                        {selectedRoutine.detalles?.[0]?.ejercicio?.localVideoPath && (
                            <span className="text-[10px] md:text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">Offline</span>
                        )}
                    </h2>
                </div>
            </div>
        </div>

        {/* LISTA DE EJERCICIOS */}
        <div className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {selectedRoutine.detalles.map((d:any, i:number) => {
              const thumbnail = CloudinaryApi.getThumbnail(d.ejercicio.imagenUrl, d.ejercicio.urlVideo);
              const videoSource = d.ejercicio.localVideoPath || d.ejercicio.urlVideo;
              
              const exerciseKey = `${selectedRoutine.id}-${d.ejercicio.id || i}`;
              const isChecked = !!checkedExercises[exerciseKey];

              return (
                  <div key={i} className={`bg-gray-800/50 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-stretch transition-all group ${isChecked ? 'opacity-70 grayscale-[0.3]' : 'hover:bg-gray-800/80'}`}>
                      <div className="w-full md:w-48 h-40 md:h-32 flex-shrink-0 bg-black/40 rounded-lg border border-white/5 overflow-hidden relative">
                          {thumbnail ? (
                              <img src={thumbnail} alt={d.ejercicio.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                  <Dumbbell className="w-10 h-10 opacity-50 text-white" />
                              </div>
                          )}
                          
                          {videoSource && (
                              <div onClick={() => handleOpenVideo(videoSource)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                                  <span className="bg-green-500/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] transform hover:scale-110 transition-transform text-xl pl-1 backdrop-blur-md border border-white/20">▶</span>
                              </div>
                          )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between w-full">
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                  <span className="bg-green-900/50 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/20">#{i + 1}</span>
                                  <h4 className={`font-bold text-lg md:text-xl transition-colors ${isChecked ? 'text-gray-500 line-through' : 'text-white'}`}>{d.ejercicio.nombre}</h4>
                              </div>
                              <button 
                                  onClick={() => toggleExerciseCheck(selectedRoutine.id, d.ejercicio.id, i)}
                                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ml-2 ${
                                      isChecked 
                                      ? 'bg-green-500 border-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                      : 'bg-black/40 border-white/20 text-transparent hover:border-green-500/50 hover:bg-white/5 backdrop-blur-sm'
                                  }`}
                              >
                                  <span className="text-xl leading-none font-bold select-none">{isChecked ? '✓' : ''}</span>
                              </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                              <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5 flex flex-col justify-center">
                                  <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider block mb-0.5">Series</span>
                                  <span className="text-lg md:text-xl font-bold text-white leading-tight">{d.series}</span>
                              </div>
                              <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5 flex flex-col justify-center">
                                  <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider block mb-0.5">Reps</span>
                                  <span className="text-lg md:text-xl font-bold text-white leading-tight">{d.repeticiones}</span>
                              </div>
                              <div className="bg-green-900/10 rounded-lg p-2 text-center border border-green-500/20 flex flex-col justify-center">
                                  <span className="text-[10px] md:text-xs text-green-500/70 uppercase font-bold tracking-wider block mb-0.5">Peso</span>
                                  <span className="text-lg md:text-xl font-bold text-green-400 leading-tight">{d.peso > 0 ? `${d.peso} kg` : '-'}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              );
            })}
        </div>
        
        {/* VIDEO MODAL (Aún necesario para mostrar el video por encima de todo) */}
        {videoUrl && (
            typeof document !== "undefined" ? createPortal(
              <div className={MyRoutinesStyles.videoContainer} onClick={closeVideo}>
                  <button onClick={closeVideo} className={MyRoutinesStyles.closeVideoBtn}>
                    <span className="text-2xl font-bold">&times;</span>
                  </button>
                  <div className="w-full max-w-4xl aspect-video px-4" onClick={(e) => e.stopPropagation()}>
                    <VideoEjercicio url={videoUrl} />
                  </div>
              </div>,
              document.body
            ) : null
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl space-y-6 mx-auto relative z-10 px-4 pb-24 pt-32 animate-fade-in">
                
          {loading ? (
             <div className="text-center py-20">
                <p className="text-xl text-green-500 font-bold animate-pulse">Cargando entrenamientos...</p>
             </div>
          ) : rutinas.length === 0 ? (
            <div className={`${AppStyles.glassCard} p-10 text-center`}>
                <div className={AppStyles.gradientDivider}></div>
                <Inbox className="w-16 h-16 opacity-50 mb-4 mx-auto text-white" />
                <p className="text-gray-300 text-lg">No tienes rutinas asignadas todavía.</p>
            </div>
          ) : (
            <div className={MyRoutinesStyles.grid}>
              {rutinas.map((rutina) => (
                <div 
                    key={rutina.id} 
                    onClick={() => setSelectedRoutine(rutina)} 
                    className={MyRoutinesStyles.routineCard + " relative"}
                >
                  <div className={AppStyles.gradientDivider}></div>

                  {/* BOTÓN DE DESCARGA */}
                  <button 
                    onClick={(e) => handleDownload(e, rutina)}
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-lg"
                  >
                    {downloadingId === rutina.id ? (
                        <CloudDownload className="w-5 h-5 text-green-400 animate-pulse" />
                    ) : downloadedIds.includes(rutina.id) ? (
                        <span title="Descargado"><CheckCircle className="w-6 h-6 text-green-400" /></span>
                    ) : (
                        <span title="Descargar"><Download className="w-6 h-6 opacity-70 text-white" /></span>
                    )}
                  </button>

                  {/* OVERLAY PROGRESO */}
                  {downloadingId === rutina.id && (
                      <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-green-400 text-xs font-bold px-4 text-center">{downloadProgress}</p>
                      </div>
                  )}

                  <div className={MyRoutinesStyles.cardHeader}>
                      <h3 className={`${MyRoutinesStyles.cardTitle} whitespace-normal break-words leading-tight`}>{rutina.nombreRutina}</h3>
                      <p className={MyRoutinesStyles.profeTag}>
                        Profe: <span className="text-gray-300">{rutina.entrenador}</span>
                      </p>
                  </div>
                  
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
                        VER DETALLE <Search className="w-5 h-5 inline-block ml-1" />
                      </span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* VIDEO MODAL */}
      {videoUrl && (
          typeof document !== "undefined" ? createPortal(
            <div className={MyRoutinesStyles.videoContainer} onClick={closeVideo}>
                <button onClick={closeVideo} className={MyRoutinesStyles.closeVideoBtn}>
                  <span className="text-2xl font-bold">&times;</span>
                </button>
                <div className="w-full max-w-4xl aspect-video px-4" onClick={(e) => e.stopPropagation()}>
                  <VideoEjercicio url={videoUrl} />
                </div>
            </div>,
            document.body
          ) : null
      )}
    </>
  );
};