import { useState, useEffect } from "react";
import { useMyRoutines } from "../../Hooks/Rutinas/useMyRoutines";
import { AppStyles } from "../../Styles/AppStyles";
import { MyRoutinesStyles } from "../../Styles/MyRoutinesStyles";
import { VideoEjercicio } from "../../Components/VideoEjercicios/VideoEjercicio"; 
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { DetallesEjerciciosApi } from "../../API/Rutinas/DetallesEjerciciosApi";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError } from "../../Helpers/Alerts";
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { createPortal } from "react-dom";
import { Inbox, CloudDownload, CheckCircle, Download, Search, Dumbbell, ArrowLeft, Play, Activity, Hand, Info, Calendar, Edit2, Save, X } from "lucide-react";

// Componente para renderizar miniaturas offline desde IndexedDB
const OfflineThumbnail = ({ path, alt }: { path: string; alt: string }) => {
    const [src, setSrc] = useState<string>('');

    useEffect(() => {
        let objectUrl: string | null = null;
        let mounted = true;

        const load = async () => {
            if (Capacitor.isNativePlatform()) {
                // Si es una URL de la nube, usarla directo
                if (path.startsWith('http')) {
                    if (mounted) setSrc(path);
                    return;
                }

                // Resolver path local nativo
                try {
                    const fileName = path.split('/').pop() || path;
                    const result = await Filesystem.getUri({
                        path: fileName,
                        directory: Directory.Data
                    });
                    if (mounted) setSrc(Capacitor.convertFileSrc(result.uri));
                } catch (e) {
                    console.error("Error obteniendo URI nativa de miniatura:", e);
                    if (mounted) setSrc(path); // Fallback
                }
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
      downloadedGroupIds, updateSelectedRoutine, fetchRoutines, syncOfflineRoutineUpdate,
      selectedDayIndex, setSelectedDayIndex
  } = useMyRoutines();

  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});
  const [editValues, setEditValues] = useState<Record<number, { series: number | string, repeticiones: string | number, peso: string | number }>>({});
  const [isRoutineEditMode, setIsRoutineEditMode] = useState(false);

  const handleEditRoutine = (e: React.MouseEvent, rutina: any) => {
      e.stopPropagation();
      setIsRoutineEditMode(true);
      setEditValues({});
      setSelectedRoutine(rutina);
  };

  const handleEditChange = (id: number, field: string, value: string | number, original: any) => {
      setEditValues(prev => ({
          ...prev,
          [id]: {
              series: prev[id]?.series !== undefined ? prev[id].series : original.series,
              repeticiones: prev[id]?.repeticiones !== undefined ? prev[id].repeticiones : original.repeticiones,
              peso: prev[id]?.peso !== undefined ? prev[id].peso : original.peso,
              [field]: value
          }
      }));
  };

  const handleSaveExercise = async (detalleId: number, originalData: any) => {
      const data = editValues[detalleId];
      if (!data) return; // No changes
      
      const series = data.series !== undefined ? data.series : originalData.series;
      const repeticiones = String(data.repeticiones !== undefined ? data.repeticiones : originalData.repeticiones).trim();
      const peso = String(data.peso !== undefined ? data.peso : originalData.peso).trim();
      
      if (series === undefined || series === null || series === '' || isNaN(Number(series)) || Number(series) <= 0) {
          showError("Las series no pueden estar vacías o ser negativas");
          return;
      }
      
      const parsedReps = parseInt(repeticiones);
      if (!repeticiones || repeticiones === "0" || repeticiones === "" || (!isNaN(parsedReps) && parsedReps < 0)) {
          showError("Las repeticiones no pueden estar vacías o negativas");
          return;
      }
      
      const parsedPeso = parseFloat(peso);
      if (peso && !isNaN(parsedPeso) && parsedPeso < 0) {
          showError("El peso no puede ser negativo");
          return;
      }
      
      try {
          let currentDetalleId = detalleId;
          let routineToUpdate = selectedRoutine;

          // Si es general, la personalizamos primero
          if (selectedRoutine.esGeneral) {
              showSuccess("Personalizando rutina para ti...");
              const reqData = selectedRoutine.esGrupo 
                  ? { grupoId: selectedRoutine.grupoId }
                  : { rutinaId: selectedRoutine.id };
                  
              routineToUpdate = await RutinasApi.personalizar(reqData);
              
              // Buscar el nuevo detalle correspondiente
              let newDetalle;
              if (routineToUpdate.esGrupo) {
                  for (const dia of routineToUpdate.dias) {
                      const found = dia.detalles.find((det: any) => det.ejercicio.id === originalData.ejercicio.id);
                      if (found) { newDetalle = found; break; }
                  }
              } else {
                  newDetalle = routineToUpdate.detalles.find((det: any) => det.ejercicio.id === originalData.ejercicio.id);
              }
              
              if (!newDetalle) {
                  showError("Error al encontrar el ejercicio en la nueva rutina");
                  return;
              }
              currentDetalleId = newDetalle.id;
          }

          // Guardar cambios en DB
          await DetallesEjerciciosApi.update(currentDetalleId, { series, repeticiones, peso });
          
          // Re-obtener TODAS las rutinas frescas desde el backend llamando al hook
          const newRoutines = await fetchRoutines();
          
          let finalRoutine = routineToUpdate;
          if (newRoutines && Array.isArray(newRoutines)) {
              if (routineToUpdate.esGrupo) {
                  const foundGroup = newRoutines.find((r: any) => r.esGrupo && r.grupoId === routineToUpdate.grupoId);
                  if (foundGroup) finalRoutine = foundGroup;
              } else {
                  const foundRoutine = newRoutines.find((r: any) => !r.esGrupo && r.id === routineToUpdate.id);
                  if (foundRoutine) finalRoutine = foundRoutine;
              }
          }

          // GESTIONAR MODO OFFLINE (Sincronización) a través del hook
          await syncOfflineRoutineUpdate(selectedRoutine, finalRoutine);

          // Actualizar en el frontend
          updateSelectedRoutine(finalRoutine);
          
          showSuccess("Ejercicio actualizado");
          
          setEditValues(prev => {
              const newObj = { ...prev };
              delete newObj[detalleId];
              return newObj;
          });
      } catch (e) {
          console.error(e);
          showError("Error al actualizar");
      }
  };

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

  // Resetear scroll al cambiar de rutina seleccionada o de día
  useEffect(() => {
    if (selectedRoutine) {
      window.scrollTo(0, 0);
      // Buscamos los contenedores con scroll que envuelven a MyRoutines (en Home.tsx)
      const scrollContainers = document.querySelectorAll('.custom-scrollbar, .overflow-y-auto');
      scrollContainers.forEach(container => {
        container.scrollTop = 0;
      });
    }
  }, [selectedRoutine, selectedDayIndex]);

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
                  onClick={() => { closeModal(); setIsRoutineEditMode(false); setEditValues({}); }} 
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
                  <div 
                      key={i} 
                      onClick={() => {
                          if (isRoutineEditMode && !editValues[d.id]) {
                              handleEditChange(d.id, 'series', d.series, d);
                              handleEditChange(d.id, 'repeticiones', d.repeticiones, d);
                              handleEditChange(d.id, 'peso', d.peso, d);
                          }
                      }}
                      className={`bg-gray-800/50 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-stretch transition-all group ${isChecked ? 'opacity-70 grayscale-[0.3]' : 'hover:bg-gray-800/80'} ${isRoutineEditMode && !editValues[d.id] ? 'cursor-pointer hover:border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : ''}`}
                  >
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
                                          {d.ejercicio.musculoTrabajado && <span className={AppStyles.tagMuscle}><Activity className="w-3 h-3" /> {d.ejercicio.musculoTrabajado}</span>}
                                          {d.ejercicio.elementosGym && <span className="flex items-center gap-1 text-[10px] md:text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30"><Dumbbell className="w-3 h-3" /> {d.ejercicio.elementosGym}</span>}
                                          {d.ejercicio.tipoAgarre && <span className={AppStyles.tagGrip}><Hand className="w-3 h-3" /> Agarre {d.ejercicio.tipoAgarre}</span>}
                                      </div>
                                  )}
                                  
                                  {/* DETALLES DE TEXTO */}
                                  {d.ejercicio.detalles && !isChecked && (
                                      <div className="mt-1 md:ml-10 text-[11px] md:text-xs text-gray-400 bg-black/20 p-2 rounded border border-white/5 leading-relaxed">
                                          <span className="flex items-center gap-1 text-gray-500 font-bold mb-0.5"><Info className="w-3 h-3" /> Notas:</span> {d.ejercicio.detalles}
                                      </div>
                                  )}
                              </div>
                              {/* ACTION BUTTONS */}
                              <div className="flex gap-2">
                                  {/* CHECKBOX (Oculto en modo edición) */}
                                  {!editValues[d.id] && !isRoutineEditMode && (
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
                                  )}
                              </div>
                          </div>
                          
                          {/* GRID DE DATOS / INPUTS */}
                          <div className="flex flex-col gap-3 w-full">
                              <div className="grid grid-cols-3 gap-2">
                                  {editValues[d.id] ? (
                                      <>
                                          <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5 flex flex-col justify-center">
                                              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Series</span>
                                              <input 
                                                  type="text"
                                                  inputMode="numeric"
                                                  value={editValues[d.id].series}
                                                  onChange={(e) => {
                                                      const val = e.target.value.replace(/[^0-9]/g, '');
                                                      handleEditChange(d.id, 'series', val === '' ? '' : parseInt(val), d);
                                                  }}
                                                  className="w-full bg-white/5 text-white font-bold text-lg md:text-xl text-center rounded border border-white/10 p-1 focus:border-green-500 focus:outline-none"
                                                  placeholder="0"
                                              />
                                          </div>
                                          <div className="bg-black/40 rounded-lg p-2 text-center border border-white/5 flex flex-col justify-center">
                                              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Reps</span>
                                              <input 
                                                  type="text"
                                                  inputMode="numeric"
                                                  value={editValues[d.id].repeticiones === "A elección" ? "" : editValues[d.id].repeticiones}
                                                  onChange={(e) => {
                                                      const val = e.target.value.replace(/[^0-9]/g, '');
                                                      handleEditChange(d.id, 'repeticiones', val, d);
                                                  }}
                                                  className="w-full bg-white/5 text-white font-bold text-lg md:text-xl text-center rounded border border-white/10 p-1 focus:border-green-500 focus:outline-none"
                                                  placeholder="0"
                                              />
                                          </div>
                                          <div className="bg-green-900/10 rounded-lg p-2 text-center border border-green-500/20 flex flex-col justify-center">
                                              <span className="text-[10px] md:text-xs text-green-500/70 uppercase font-bold tracking-wider block mb-1">Peso (kg)</span>
                                              <input 
                                                  type="text"
                                                  inputMode="decimal"
                                                  value={editValues[d.id].peso === "A elección" ? "" : editValues[d.id].peso}
                                                  onChange={(e) => {
                                                      let val = e.target.value.replace(/[^0-9.]/g, '');
                                                      if ((val.match(/\./g) || []).length > 1) {
                                                          val = val.substring(0, val.lastIndexOf('.'));
                                                      }
                                                      handleEditChange(d.id, 'peso', val, d);
                                                  }}
                                                  className="w-full bg-white/5 text-green-400 font-bold text-lg md:text-xl text-center rounded border border-green-500/30 p-1 focus:border-green-500 focus:outline-none"
                                                  placeholder="0"
                                              />
                                          </div>
                                      </>
                                  ) : (
                                      <>
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
                                              <span className="text-lg md:text-xl font-bold text-green-400 leading-tight">{d.peso > 0 ? `${d.peso} kg` : d.peso}</span>
                                          </div>
                                      </>
                                  )}
                              </div>

                              {/* Botones Guardar/Cancelar abajo de los inputs */}
                              {editValues[d.id] && !isChecked && (
                                  <div className="flex gap-2 w-full mt-1 justify-end">
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); handleSaveExercise(d.id, d); }}
                                          className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                                          title="Guardar"
                                      >
                                          <Save className="w-5 h-5" />
                                      </button>
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setEditValues(prev => {
                                                  const newObj = { ...prev };
                                                  delete newObj[d.id];
                                                  return newObj;
                                              });
                                          }}
                                          className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all"
                                          title="Cancelar"
                                      >
                                          <X className="w-5 h-5" />
                                      </button>
                                  </div>
                              )}
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

                      {/* BOTONES SUPERIORES (Edición y Descarga) */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                          <button 
                            onClick={(e) => handleEditRoutine(e, rutina)}
                            className="p-2 rounded-full bg-blue-500/20 text-blue-400 backdrop-blur-md border border-blue-500/50 hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-lg"
                            title="Editar Rutina"
                          >
                              <Edit2 className="w-5 h-5" />
                          </button>
                          
                          <button 
                            onClick={(e) => handleDownload(e, rutina)}
                            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-lg"
                          >
                            {isDownloading ? (
                                <CloudDownload className="w-5 h-5 text-green-400 animate-pulse" />
                            ) : isDownloaded ? (
                                <span title="Descargado"><CheckCircle className="w-6 h-6 text-green-400" /></span>
                            ) : (
                                <span title="Descargar"><Download className="w-6 h-6 opacity-70 text-white" /></span>
                            )}
                          </button>
                      </div>

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