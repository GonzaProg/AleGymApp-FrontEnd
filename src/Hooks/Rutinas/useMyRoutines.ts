import { useState, useEffect } from "react";
import { useAuthUser } from "../Auth/useAuthUser";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { DownloadRoutineService } from "../../Helpers/DownloadRoutineService"; 
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

        } catch (error) {
            console.warn("⚠️ Sin conexión o error API. Cargando modo offline...");
            
            // 3. Fallback: Cargar desde almacenamiento local
            const localRoutines = await DownloadRoutineService.getUserRoutinesList(currentUser.id);
            
            if (localRoutines.length > 0) {
                setRutinas(localRoutines);
                setIsOfflineMode(true); // Para mostrar aviso en UI
                checkDownloadedRoutines(localRoutines);
                showSuccess("Modo Offline: Cargando rutinas guardadas.");
            } else {
                showError("No hay conexión y no tienes rutinas guardadas.");
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
        isOfflineMode, // Puedo usar esto mas adelante para poner un cartelito "Sin Conexión"
        // Multi-día
        selectedDayIndex,
        setSelectedDayIndex
    };
};