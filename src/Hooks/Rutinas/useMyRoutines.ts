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
    
    // OFFLINE STATES
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState("");
    const [downloadedIds, setDownloadedIds] = useState<number[]>([]);
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
        for (const r of rutinasApi) {
            const isDown = await DownloadRoutineService.isRoutineDownloaded(r.id);
            if (isDown) ids.push(r.id);
        }
        setDownloadedIds(ids);
    };

    const handleDownload = async (e: React.MouseEvent, rutina: any) => {
        e.stopPropagation();
        
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
    };

    const handleSelectRoutine = async (rutina: any) => {
        // Siempre intentamos buscar la versión "rica" (con paths locales) si existe
        const offlineData = await DownloadRoutineService.getOfflineRoutine(rutina.id);
        
        if (offlineData) {
            console.log("📂 Abriendo versión OFFLINE (Videos locales)");
            setSelectedRoutine(offlineData);
        } else {
            console.log("☁️ Abriendo versión ONLINE (Streaming)");
            // Si estamos offline y no descargó esta rutina específica, 
            // igual la puede ver (texto), pero los videos fallarán si no hay internet.
            setSelectedRoutine(rutina);
        }
    };

    const closeModal = () => setSelectedRoutine(null);
    const handleOpenVideo = (url: string) => { if (url) setVideoUrl(url); };
    const closeVideo = () => setVideoUrl(null);

    return {
        rutinas,
        loading,
        selectedRoutine,
        setSelectedRoutine: handleSelectRoutine,
        videoUrl,
        closeModal,
        closeVideo,
        handleOpenVideo,
        handleDownload,
        downloadingId,
        downloadProgress,
        downloadedIds,
        isOfflineMode // Puedo usar esto mas adelante para poner un cartelito "Sin Conexión"
    };
};