import { useState, useEffect } from "react";
import { AsistenciaApi } from "../../API/Asistencias/AsistenciaApi";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useStudentHome = (currentUser: any) => {
    const [concurrencia, setConcurrencia] = useState<number | null>(null);
    const [loadingConcurrencia, setLoadingConcurrencia] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    
    // Estado para abrir/cerrar la cámara
    const [isScannerOpen, setIsScannerOpen] = useState(false); 

    const gymId = currentUser?.gym?.id;

    const cargarConcurrencia = async () => {
        if (!gymId) return;
        try {
            const estimacion = await AsistenciaApi.obtenerConcurrencia(gymId);
            setConcurrencia(estimacion);
        } catch (error) {
            console.error("Error al cargar concurrencia", error);
        } finally {
            setLoadingConcurrencia(false);
        }
    };

    // Sin setInterval: solo carga al entrar a la vista
    useEffect(() => {
        cargarConcurrencia();
    }, [gymId]);

    const handleCheckIn = async (scannedText: string) => {
        if (!gymId) return;
        
        // Limpiamos espacios y convertimos directamente a número
        const scannedGymId = Number(scannedText.trim());
        
        // Validamos únicamente contra el ID numérico del gimnasio
        if (scannedGymId !== gymId) {
            showError("Este código QR no pertenece a tu gimnasio.");
            console.log("Leído por el QR:", scannedText); // Te sirve para debuggear por si acaso
            return;
        }

        setIsCheckingIn(true);
        try {
            await AsistenciaApi.registrarEntrada(gymId);
            showSuccess("¡Entrada registrada! A entrenar duro 💪");
            
            // Actualizamos la métrica de concurrencia al momento
            cargarConcurrencia();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Error al registrar entrada";
            showError(errorMsg);
        } finally {
            setIsCheckingIn(false);
        }
    };

    return {
        concurrencia,
        loadingConcurrencia,
        isCheckingIn,
        handleCheckIn,
        isScannerOpen,
        setIsScannerOpen
    };
};