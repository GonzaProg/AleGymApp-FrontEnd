import { useState, useEffect } from "react";
import { useAuthUser } from "../Auth/useAuthUser";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { DownloadRoutineService } from "../../Helpers/DownloadRoutineService"; 
import { Preferences } from '@capacitor/preferences';
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useMyRoutines = () => {
    const { currentUser } = useAuthUser();

    const [rutinas, setRutinas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoFallbackUrl, setVideoFallbackUrl] = useState<string | null>(null);
    
    // Para rutinas multi-día: track del día seleccionado
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    
    // OFFLINE STATES
    const [downloadingId, setDownloadingId] = useState<number | string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState("");
    const [downloadedIds, setDownloadedIds] = useState<number[]>([]);
    const [downloadedGroupIds, setDownloadedGroupIds] = useState<string[]>([]);
    const [isOfflineMode, setIsOfflineMode] = useState(false); 

    useEffect(() => {
        if (currentUser?.id) {
            fetchRoutines();
        }
    }, [currentUser]);

    const fetchRoutines = async () => {
        if (!currentUser?.id) return;

        setLoading(true);
        try {
            // 1. Intentar cargar desde API (Online)
            const data = await RutinasApi.getByUser(currentUser.id);
            
            // 2. Si hay éxito, guardamos respaldo local
            setRutinas(data);
            await DownloadRoutineService.saveUserRoutinesList(currentUser.id, data);
            
            setIsOfflineMode(false);
            checkDownloadedRoutines(data);
            return data;

        } catch (error) {
            console.warn("⚠️ Sin conexión o error API. Cargando modo offline...");
            
            // 3. Fallback: Cargar desde almacenamiento local
            const localRoutines = await DownloadRoutineService.getUserRoutinesList(currentUser.id);
            
            if (localRoutines.length > 0) {
                setRutinas(localRoutines);
                setIsOfflineMode(true); // Para mostrar aviso en UI
                checkDownloadedRoutines(localRoutines);
                showSuccess("Modo Offline: Cargando rutinas guardadas.");
                return localRoutines;
            } else {
                showError("No hay conexión y no tienes rutinas guardadas.");
                return [];
            }
        } finally {
            setLoading(false);
        }
    };

    const checkDownloadedRoutines = async (rutinasApi: any[]) => {
        const ids: number[] = [];
        const groupIds: string[] = [];
        
        for (const r of rutinasApi) {
            if (r.esGrupo) {
                // Para grupos, chequeamos si TODOS los días están descargados
                const isGroupDown = await DownloadRoutineService.isGroupDownloaded(r);
                if (isGroupDown) {
                    groupIds.push(r.grupoId);
                }
                // También trackear IDs individuales para la vista detalle
                for (const dia of r.dias) {
                    const isDown = await DownloadRoutineService.isRoutineDownloaded(dia.id);
                    if (isDown) ids.push(dia.id);
                }
            } else {
                const isDown = await DownloadRoutineService.isRoutineDownloaded(r.id);
                if (isDown) ids.push(r.id);
            }
        }
        setDownloadedIds(ids);
        setDownloadedGroupIds(groupIds);
    };

    const handleDownload = async (e: React.MouseEvent, rutina: any) => {
        e.stopPropagation();
        
        const esGrupo = rutina.esGrupo;

        if (esGrupo) {
            // === DESCARGA DE GRUPO ===
            const grupoId = rutina.grupoId;
            
            if (downloadedGroupIds.includes(grupoId)) {
                // Ya descargado → eliminar
                const confirm = window.confirm(`¿Eliminar descarga de "${rutina.nombreRutina}" (${rutina.dias.length} días) del dispositivo?`);
                if (confirm) {
                    await DownloadRoutineService.deleteOfflineGroup(rutina);
                    setDownloadedGroupIds(prev => prev.filter(id => id !== grupoId));
                    // Limpiar IDs individuales también
                    const diaIds = rutina.dias.map((d: any) => d.id);
                    setDownloadedIds(prev => prev.filter(id => !diaIds.includes(id)));
                    showSuccess("Rutina eliminada del dispositivo.");
                }
                return;
            }

            setDownloadingId(grupoId);
            setDownloadProgress("Iniciando descarga...");

            try {
                await DownloadRoutineService.downloadGroup(rutina, (msg) => setDownloadProgress(msg));
                setDownloadedGroupIds(prev => [...prev, grupoId]);
                // Marcar todos los días como descargados
                const diaIds = rutina.dias.map((d: any) => d.id);
                setDownloadedIds(prev => [...prev, ...diaIds]);
                showSuccess(`¡Rutina descargada (${rutina.dias.length} días)! Disponible sin internet.`);
            } catch (error) {
                showError("Error en la descarga. Verifica tu internet.");
            } finally {
                setDownloadingId(null);
                setDownloadProgress("");
            }
        } else {
            // === DESCARGA INDIVIDUAL (lógica original) ===
            if (downloadedIds.includes(rutina.id)) {
                const confirm = window.confirm("¿Eliminar descarga del dispositivo?");
                if (confirm) {
                    const localData = await DownloadRoutineService.getOfflineRoutine(rutina.id);
                    await DownloadRoutineService.deleteOfflineRoutine(localData || rutina);
                    setDownloadedIds(prev => prev.filter(id => id !== rutina.id));
                    showSuccess("Rutina eliminada del celular.");
                }
                return;
            }

            setDownloadingId(rutina.id);
            setDownloadProgress("Iniciando...");

            try {
                await DownloadRoutineService.downloadRoutine(rutina, (msg) => setDownloadProgress(msg));
                setDownloadedIds(prev => [...prev, rutina.id]);
                showSuccess("¡Rutina descargada! Disponible sin internet.");
            } catch (error) {
                showError("Error en la descarga. Verifica tu internet.");
            } finally {
                setDownloadingId(null);
                setDownloadProgress("");
            }
        }
    };

    const handleSelectRoutine = async (rutina: any) => {
        setSelectedDayIndex(0); // Reset al primer día
        window.scrollTo(0, 0); // Scroll al inicio
        
        if (rutina.esGrupo) {
            // Para grupos: intentar cargar la versión offline
            if (downloadedGroupIds.includes(rutina.grupoId)) {
                const offlineGroup = await DownloadRoutineService.getOfflineGroup(rutina);
                setSelectedRoutine(offlineGroup);
            } else {
                setSelectedRoutine(rutina);
            }
            return;
        }
        
        // Siempre intentamos buscar la versión "rica" (con paths locales) si existe
        const offlineData = await DownloadRoutineService.getOfflineRoutine(rutina.id);
        
        if (offlineData) {
            setSelectedRoutine(offlineData);
        } else {
            setSelectedRoutine(rutina);
        }
    };

    const closeModal = () => { setSelectedRoutine(null); setSelectedDayIndex(0); };
    const handleOpenVideo = (url: string, fallbackUrl?: string) => { 
        if (url) {
            setVideoUrl(url);
            setVideoFallbackUrl(fallbackUrl || null);
        }
    };
    const closeVideo = () => { setVideoUrl(null); setVideoFallbackUrl(null); };

    const syncOfflineRoutineUpdate = async (oldRoutine: any, newRoutine: any) => {
        const offlineCheckId = oldRoutine.esGrupo ? oldRoutine.grupoId : oldRoutine.id;
        let oldRutinaWasDownloaded = false;
        
        if (oldRoutine.esGrupo) {
            oldRutinaWasDownloaded = downloadedGroupIds.includes(offlineCheckId);
        } else {
            oldRutinaWasDownloaded = downloadedIds.includes(offlineCheckId);
        }

        if (!oldRutinaWasDownloaded) return;

        // 1. Extraer todos los ejercicios viejos y nuevos
        const oldExercises = new Map<number, any>();
        const newExercises = new Map<number, any>();
        
        const extractExercises = (routine: any, map: Map<number, any>) => {
            if (routine.esGrupo) {
                routine.dias?.forEach((dia: any) => {
                    dia.detalles?.forEach((d: any) => map.set(d.ejercicio.id, d.ejercicio));
                });
            } else {
                routine.detalles?.forEach((d: any) => map.set(d.ejercicio.id, d.ejercicio));
            }
        };

        // Obtener la data vieja con paths locales
        let oldOfflineData = null;
        if (oldRoutine.esGrupo) {
            oldOfflineData = await DownloadRoutineService.getOfflineGroup(oldRoutine);
        } else {
            oldOfflineData = await DownloadRoutineService.getOfflineRoutine(oldRoutine.id);
        }

        if (oldOfflineData) {
            extractExercises(oldOfflineData, oldExercises);
        }
        extractExercises(newRoutine, newExercises);

        // 2. Copiar los paths locales a los ejercicios de la nueva rutina
        const copyPaths = (routine: any) => {
            const list = routine.esGrupo ? routine.dias.flatMap((d: any) => d.detalles) : routine.detalles;
            list?.forEach((d: any) => {
                const oldEj = oldExercises.get(d.ejercicio.id);
                if (oldEj) {
                    d.ejercicio.localVideoPath = oldEj.localVideoPath;
                    d.ejercicio.localThumbnailPath = oldEj.localThumbnailPath;
                }
            });
        };
        copyPaths(newRoutine);

        // 3. Guardar la nueva rutina para reflejar los cambios enseguida en UI
        const saveRoutine = async (routine: any) => {
            if (routine.esGrupo) {
                for (const dia of routine.dias) {
                    await Preferences.set({ key: `offline_routine_${dia.id}`, value: JSON.stringify(dia) });
                }
            } else {
                await Preferences.set({ key: `offline_routine_${routine.id}`, value: JSON.stringify(routine) });
            }
        };
        await saveRoutine(newRoutine);

        // 4. Si la rutina era general (se personalizó) cambiar los IDs guardados offline
        if (oldRoutine.esGeneral) {
            if (oldRoutine.esGrupo) {
                for (const dia of oldRoutine.dias) {
                    await Preferences.remove({ key: `offline_routine_${dia.id}` });
                }
                setDownloadedGroupIds(prev => prev.filter(id => id !== oldRoutine.grupoId).concat(newRoutine.grupoId));
                const oldDiaIds = oldRoutine.dias.map((d: any) => d.id);
                const newDiaIds = newRoutine.dias.map((d: any) => d.id);
                setDownloadedIds(prev => prev.filter(id => !oldDiaIds.includes(id)).concat(newDiaIds));
            } else {
                await Preferences.remove({ key: `offline_routine_${oldRoutine.id}` });
                setDownloadedIds(prev => prev.filter(id => id !== oldRoutine.id).concat(newRoutine.id));
            }
        }

        // 5. Descargar videos faltantes y eliminar los borrados en BACKGROUND
        const processMediaInBackground = async () => {
            try {
                // Eliminar archivos viejos que ya no están en la rutina
                for (const [id, oldEj] of oldExercises.entries()) {
                    if (!newExercises.has(id)) {
                        await DownloadRoutineService.deleteOfflineExerciseMedia(oldEj);
                    }
                }

                // Descargar archivos nuevos
                let hasChanges = false;
                for (const [id, newEj] of newExercises.entries()) {
                    if (!oldExercises.has(id)) {
                        await DownloadRoutineService.downloadOfflineExerciseMedia(newEj);
                        hasChanges = true;
                    }
                }

                // Actualizar la rutina offline con los paths descargados
                if (hasChanges) {
                    await saveRoutine(newRoutine);
                }
            } catch (e) {
                console.error("Error al sincronizar multimedia de ejercicios offline en 2do plano", e);
            }
        };
        
        processMediaInBackground(); // No hacemos await para que no bloquee UI
    };

    return {
        rutinas,
        loading,
        selectedRoutine,
        setSelectedRoutine: handleSelectRoutine,
        videoUrl,
        closeModal,
        closeVideo,
        handleOpenVideo,
        videoFallbackUrl,
        handleDownload,
        downloadingId,
        downloadProgress,
        downloadedIds,
        downloadedGroupIds,
        isOfflineMode, 
        updateSelectedRoutine: setSelectedRoutine,
        fetchRoutines,
        syncOfflineRoutineUpdate,
        // Multi-día
        selectedDayIndex,
        setSelectedDayIndex
    };
};