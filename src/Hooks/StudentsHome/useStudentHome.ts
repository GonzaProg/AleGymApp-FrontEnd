import { useState, useEffect } from "react";
import { AsistenciaApi } from "../../API/Asistencias/AsistenciaApi";
import { showSuccess, showError } from "../../Helpers/Alerts"; // Ajusta a tus alertas

export const useStudentHome = (currentUser: any) => {
    const [concurrencia, setConcurrencia] = useState<number | null>(null);
    const [loadingConcurrencia, setLoadingConcurrencia] = useState(true);
    const [isCheckingIn, setIsCheckingIn] = useState(false);

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

    // Cargar los datos cuando el componente se monta
    useEffect(() => {
        cargarConcurrencia();
        
        // Opcional: Refrescar la concurrencia cada 5 minutos
        const interval = setInterval(cargarConcurrencia, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [gymId]);

    // Función para el botón de "Registrar Entrada"
    const handleCheckIn = async () => {
        if (!gymId) return;
        setIsCheckingIn(true);
        try {
            await AsistenciaApi.registrarEntrada(gymId);
            showSuccess("¡Entrada registrada! A entrenar duro 💪");
            // Recargamos el contador para que sume al usuario actual
            cargarConcurrencia();
        } catch (error: any) {
            // Si es el error de "ya registraste tu entrada", mostramos alerta
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
        handleCheckIn
    };
};