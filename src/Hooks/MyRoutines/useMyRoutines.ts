import { useState, useEffect } from "react";
import { useAuthUser } from "../Auth/useAuthUser"; // Recuperado
import { RutinasApi } from "../../API/Rutinas/RutinasApi"; // Recuperado
import { DownloadRoutineService } from "../../Helpers/DownloadRoutineService"; 
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useMyRoutines = () => {
    const { currentUser } = useAuthUser(); // Recuperado

    const [rutinas, setRutinas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    
    // OFFLINE STATES
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [downloadProgress, setDownloadProgress] = useState("");
    const [downloadedIds, setDownloadedIds] = useState<number[]>([]);

    useEffect(() => {
        fetchRoutines();
    }, [currentUser]); // Dependencia currentUser restaurada

    const fetchRoutines = async () => {
        // Validación del código viejo: Si no hay usuario, no cargamos
        if (!currentUser?.id) return;

        try {
            setLoading(true);
            
            // --- CAMBIO CLAVE: Usamos la API que sí te funciona ---
            const data = await RutinasApi.getByUser(currentUser.id);
            setRutinas(data);
            
            // Chequeamos cuáles están descargadas
            checkDownloadedRoutines(data);

        } catch (error) {
            console.error("Error cargando rutinas", error);
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

    // --- DOWNLOAD LOGIC ---
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
            showError("Error en la descarga.");
        } finally {
            setDownloadingId(null);
            setDownloadProgress("");
        }
    };

    // --- SELECT LOGIC (Hybrid) ---
    const handleSelectRoutine = async (rutina: any) => {
        const offlineData = await DownloadRoutineService.getOfflineRoutine(rutina.id);
        if (offlineData) {
            console.log("📂 Usando versión OFFLINE");
            setSelectedRoutine(offlineData);
        } else {
            console.log("☁️ Usando versión ONLINE");
            setSelectedRoutine(rutina);
        }
    };

    const closeModal = () => setSelectedRoutine(null);
    
    const handleOpenVideo = (url: string) => {
        if (url) setVideoUrl(url);
    };
    
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
        downloadedIds
    };
};