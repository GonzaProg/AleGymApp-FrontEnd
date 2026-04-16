import { useState, useEffect } from "react";
import { useMyRoutines } from "../../Hooks/Rutinas/useMyRoutines";
import { AppStyles } from "../../Styles/AppStyles";
import { MyRoutinesStyles } from "../../Styles/MyRoutinesStyles";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio"; 
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { createPortal } from "react-dom";
import { Inbox, CloudDownload, CheckCircle, Download, Search, Dumbbell, ArrowLeft, Play, Activity, Hand, Info, Calendar } from "lucide-react";

// Componente para renderizar miniaturas offline desde IndexedDB
const OfflineThumbnail = ({ path, alt }: { path: string; alt: string }) => {
    const [src, setSrc] = useState<string>('');

    useEffect(() => {
        let objectUrl: string | null = null;
        let mounted = true;

        const load = async () => {
            if (Capacitor.isNativePlatform()) {
                if (mounted) setSrc(path.startsWith('file://') ? Capacitor.convertFileSrc(path) : path);
                return;
            }
            
            // Web: leer de IndexedDB
            try {
                const fileName = path.split('/').pop() || path;
                const file = await Filesystem.readFile({ path: fileName, directory: Directory.Data });
                const byteChars = atob(file.data as string);
                const byteArrays = [];
                for (let i = 0; i < byteChars.length; i += 512) {
                    const slice = byteChars.slice(i, i + 512);
                    const bytes = new Uint8Array(slice.length);
                    for (let j = 0; j < slice.length; j++) bytes[j] = slice.charCodeAt(j);
                    byteArrays.push(bytes);
                }
                const blob = new Blob(byteArrays, { type: 'image/jpeg' });
                objectUrl = URL.createObjectURL(blob);
                if (mounted) setSrc(objectUrl);
            } catch {
                // Fallback: intentar usar el path directamente (por si es una URL)
                if (mounted) setSrc(path);
            }
        };

        load();
        return () => { mounted = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [path]);

    if (!src) return <div className="w-full h-full bg-gray-800 animate-pulse" />;
    return <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />;
};

export const MyRoutines = () => {
  
  const { 
      rutinas, loading, selectedRoutine, setSelectedRoutine, 
      videoUrl, closeModal, closeVideo, handleOpenVideo, videoFallbackUrl,
      handleDownload, downloadingId, downloadProgress, downloadedIds,
      downloadedGroupIds,
      selectedDayIndex, setSelectedDayIndex
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

  // === VISTA DETALLE DE RUTINA SELECCIONADA ===
  if (selectedRoutine) {
    const esGrupo = selectedRoutine.esGrupo;
    
    // Determinar la rutina actual a mostrar
    let currentDayRoutine: any;
    let displayName: string;
    
    if (esGrupo) {
      currentDayRoutine = selectedRoutine.dias[selectedDayIndex] || selectedRoutine.dias[0];
      displayName = selectedRoutine.nombreRutina;
    } else {
      currentDayRoutine = selectedRoutine;
      displayName = selectedRoutine.nombreRutina;
    }

    const currentDetalles = currentDayRoutine?.detalles || [];

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
                        {displayName}
                        {esGrupo && (
                            <span className="text-[10px] md:text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 whitespace-nowrap flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {selectedRoutine.dias.length} días
                            </span>
                        )}
                        {currentDetalles.some((d: any) => d.ejercicio?.localVideoPath || d.ejercicio?.localThumbnailPath) && (
                            <span className="text-[10px] md:text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 whitespace-nowrap">Offline</span>
                        )}
                    </h2>
                </div>
            </div>

            {/* TABS DE DÍAS (solo si es grupo) */}
            {esGrupo && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {selectedRoutine.dias.map((_: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDayIndex(index)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                selectedDayIndex === index 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Día {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* LISTA DE EJERCICIOS */}
        <div className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {currentDetalles.map((d:any, i:number) => {
              const thumbnail = d.ejercicio.localThumbnailPath || CloudinaryApi.getThumbnail(d.ejercicio.imagenUrl, d.ejercicio.urlVideo);
              const videoSource = d.ejercicio.localVideoPath || d.ejercicio.urlVideo;
              // Si hay thumbnail local, necesitamos leerlo de IndexedDB
              const isLocalThumb = !!d.ejercicio.localThumbnailPath;
              
              const routineIdForCheck = esGrupo ? currentDayRoutine.id : selectedRoutine.id;
              const exerciseKey = `${routineIdForCheck}-${d.ejercicio.id || i}`;
              const isChecked = !!checkedExercises[exerciseKey];

              return (
                  <div key={i} className={`bg-gray-800/50 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-stretch transition-all group ${isChecked ? 'opacity-70 grayscale-[0.3]' : 'hover:bg-gray-800/80'}`}>
                      <div className="w-full md:w-48 h-40 md:h-32 flex-shrink-0 bg-black/40 rounded-lg border border-white/5 overflow-hidden relative">
                          {thumbnail ? (
                              isLocalThumb ? (
                                  <OfflineThumbnail path={thumbnail} alt={d.ejercicio.nombre} />
                              ) : (
                                  <img src={thumbnail} alt={d.ejercicio.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              )
                          ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                  <Dumbbell className="w-10 h-10 opacity-50 text-white" />
                              </div>
                          )}
                          
                          {videoSource && (
                              <div onClick={() => handleOpenVideo(videoSource, d.ejercicio.urlVideo)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]">
                                  <span className="bg-green-500/80 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] transform hover:scale-110 transition-transform backdrop-blur-md border border-white/20">
                                      <Play className="w-5 h-5 ml-1 fill-white text-white" />
                                  </span>
                              </div>
                          )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between w-full">
                          <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col gap-1 w-full mr-2">
                                  <div className="flex items-center gap-3">
                                      <span className="bg-green-900/50 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/20">#{i + 1}</span>
                                      <h4 className={`font-bold text-lg md:text-xl transition-colors ${isChecked ? 'text-gray-500 line-through' : 'text-white'}`}>{d.ejercicio.nombre}</h4>
                                  </div>
                                  
                                  {/* INFO EXTRA DEL EJERCICIO */}
                                  {(d.ejercicio.musculoTrabajado || d.ejercicio.tipoAgarre || d.ejercicio.elementosGym) && !isChecked && (
                                      <div className="flex flex-wrap gap-2 mt-1 md:ml-10">
                                          {d.ejercicio.musculoTrabajado && <span className="flex items-center gap-1 text-[10px] md:text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30"><Activity className="w-3 h-3" /> {d.ejercicio.musculoTrabajado}</span>}
                                          {d.ejercicio.elementosGym && <span className="flex items-center gap-1 text-[10px] md:text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30"><Dumbbell className="w-3 h-3" /> {d.ejercicio.elementosGym}</span>}
                                          {d.ejercicio.tipoAgarre && <span className="flex items-center gap-1 text-[10px] md:text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30"><Hand className="w-3 h-3" /> Agarre {d.ejercicio.tipoAgarre}</span>}
                                      </div>
                                  )}
                                  
                                  {/* DETALLES DE TEXTO */}
                                  {d.ejercicio.detalles && !isChecked && (
                                      <div className="mt-1 md:ml-10 text-[11px] md:text-xs text-gray-400 bg-black/20 p-2 rounded border border-white/5 leading-relaxed">
                                          <span className="flex items-center gap-1 text-gray-500 font-bold mb-0.5"><Info className="w-3 h-3" /> Notas:</span> {d.ejercicio.detalles}
                                      </div>
                                  )}
                              </div>
                              <button 
                                  onClick={() => toggleExerciseCheck(routineIdForCheck, d.ejercicio.id, i)}
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
                    <VideoEjercicio url={videoUrl} fallbackUrl={videoFallbackUrl || undefined} />
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
      <div className="w-full max-w-6xl space-y-6 mx-auto relative z-10 px-4 pb-32 mt-32 pt-safe animate-fade-in">
                
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
              {rutinas.map((rutina) => {
                const esGrupo = rutina.esGrupo;
                const key = esGrupo ? rutina.grupoId : rutina.id;

                // Determinar si esta rutina/grupo está descargado
                const isDownloaded = esGrupo 
                    ? downloadedGroupIds.includes(rutina.grupoId)
                    : downloadedIds.includes(rutina.id);
                const isDownloading = esGrupo 
                    ? downloadingId === rutina.grupoId 
                    : downloadingId === rutina.id;

                return (
                    <div 
                        key={key} 
                        onClick={() => setSelectedRoutine(rutina)} 
                        className={MyRoutinesStyles.routineCard + " relative"}
                    >
                      <div className={AppStyles.gradientDivider}></div>

                      {/* BOTÓN DE DESCARGA (individual y grupos) */}
                      <button 
                        onClick={(e) => handleDownload(e, rutina)}
                        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-lg"
                      >
                        {isDownloading ? (
                            <CloudDownload className="w-5 h-5 text-green-400 animate-pulse" />
                        ) : isDownloaded ? (
                            <span title="Descargado"><CheckCircle className="w-6 h-6 text-green-400" /></span>
                        ) : (
                            <span title="Descargar"><Download className="w-6 h-6 opacity-70 text-white" /></span>
                        )}
                      </button>

                      {/* OVERLAY PROGRESO */}
                      {isDownloading && (
                          <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                              <p className="text-green-400 text-xs font-bold px-4 text-center">{downloadProgress}</p>
                          </div>
                      )}

                      <div className={MyRoutinesStyles.cardHeader}>
                          <h3 className={`${MyRoutinesStyles.cardTitle} whitespace-normal break-words leading-tight mb-2`}>{rutina.nombreRutina}</h3>
                          {esGrupo && (
                              <span className="inline-flex items-center gap-1 mt-1 bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-500/30">
                                  <Calendar className="w-3 h-3" />
                                  {rutina.dias.length} días
                              </span>
                          )}
                      </div>
                      
                      <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-2 font-bold uppercase tracking-wider">Ejercicios:</p>
                          
                          {esGrupo ? (
                              /* Vista de días para grupos */
                              <div className="space-y-2">
                                  {rutina.dias.slice(0, 3).map((dia: any, diaIndex: number) => (
                                      <div key={diaIndex} className="bg-black/20 rounded-lg p-2 border border-white/5">
                                          <p className="text-xs text-green-400 font-bold mb-1">Día {diaIndex + 1} · {dia.detalles?.length || 0} ej.</p>
                                          {dia.detalles?.slice(0, 2).map((d: any, i: number) => (
                                              <p key={i} className="text-xs text-gray-500">• {d.ejercicio.nombre}</p>
                                          ))}
                                          {(dia.detalles?.length || 0) > 2 && (
                                              <p className="text-xs text-gray-600 italic">... y {dia.detalles.length - 2} más</p>
                                          )}
                                      </div>
                                  ))}
                                  {rutina.dias.length > 3 && (
                                      <p className="text-xs text-gray-600 italic">... y {rutina.dias.length - 3} días más</p>
                                  )}
                              </div>
                          ) : (
                              /* Vista normal para rutinas individuales */
                              rutina.detalles && rutina.detalles.length > 0 ? (
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
                              )
                          )}
                      </div>

                      <div className="text-center pt-2 mt-auto">
                          <span className={MyRoutinesStyles.viewDetailBtn}>
                            VER DETALLE <Search className="w-5 h-5 inline-block ml-1" />
                          </span>
                      </div>
                    </div>
                );
              })}
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
                  <VideoEjercicio url={videoUrl} fallbackUrl={videoFallbackUrl || undefined} />
                </div>
            </div>,
            document.body
          ) : null
      )}
    </>
  );
};