import { useState, useEffect, useRef } from 'react';
import { AsistenciaApi } from "../../API/Asistencias/AsistenciaApi";

// Añadimos isHabilitado como tercer parámetro
export const useAlertasRecepcion = (isEntrenador: boolean, gymId?: number, isHabilitado: boolean = true) => {
    const [hasAlert, setHasAlert] = useState(false);
    const lastCountRef = useRef<number>(0);

    useEffect(() => {
        // Si no está habilitado desde las preferencias del gimnasio, cortamos la ejecución y NO hay setInterval
        if (!isEntrenador || !gymId || !isHabilitado) return;

        const stored = localStorage.getItem(`lastSeenExcedidos_${gymId}`);
        if (stored) {
            lastCountRef.current = Number(stored);
        }

        const checkAlertas = async () => {
            try {
                const currentCount = await AsistenciaApi.obtenerAlertasHoy();
                if (currentCount > lastCountRef.current) {
                    setHasAlert(true);
                }
            } catch (error) {
                console.error("Error silencioso buscando alertas");
            }
        };

        checkAlertas(); 
        const interval = setInterval(checkAlertas, 30000); 
        
        return () => clearInterval(interval);
    }, [isEntrenador, gymId, isHabilitado]); // Lo agregamos a las dependencias

    const clearAlert = async () => {
        if (!hasAlert) return;
        setHasAlert(false);
        try {
            const currentCount = await AsistenciaApi.obtenerAlertasHoy();
            lastCountRef.current = currentCount;
            localStorage.setItem(`lastSeenExcedidos_${gymId}`, currentCount.toString());
        } catch (e) {}
    };

    return { hasAlert, clearAlert };
};