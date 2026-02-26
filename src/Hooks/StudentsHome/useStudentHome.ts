import { useState, useEffect } from "react";
import { AsistenciaApi } from "../../API/Asistencias/AsistenciaApi";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useStudentHome = (currentUser: any) => {
    const [concurrencia, setConcurrencia] = useState<number | null>(null);
    const [loadingConcurrencia, setLoadingConcurrencia] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const isAsistenciaHabilitada = currentUser?.gym?.moduloAsistencia !== false; // true por defecto
    
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

    useEffect(() => {
        if (isAsistenciaHabilitada) {
            cargarConcurrencia();
        }
    }, [gymId, isAsistenciaHabilitada]);

    const handleCheckIn = async (scannedText: string) => {
        if (!gymId) return;
        
        const scannedGymId = Number(scannedText.trim());
        
        if (scannedGymId !== gymId) {
            showError("Este código QR no pertenece a tu gimnasio.");
            return;
        }

        setIsCheckingIn(true);
        try {
            // Guardamos la respuesta completa
            const response = await AsistenciaApi.registrarEntrada(gymId);
            
            // Verificamos si se pasó de los días de su plan
            if (response.excedido) {
                // Puedes usar showError o crear un showWarning en tus alertas
                showError("⚠️ Has excedido los días de tu plan. Tu asistencia fue registrada, pero debes regularizar tu situación en recepción.");
            } else {
                showSuccess("¡Entrada registrada! A entrenar duro 💪");
            }
            
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
        setIsScannerOpen,
        isAsistenciaHabilitada
    };
};