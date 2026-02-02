import { useState, useEffect } from "react";
import { GymApi } from "../../API/Gym/GymApi";
import { showError } from "../../Helpers/Alerts";

export const usePreferences = () => {
    // DB Settings
    const [autoBirthday, setAutoBirthday] = useState(true);
    const [autoReceipts, setAutoReceipts] = useState(true);
    
    // LocalStorage Settings (Métricas)
    // Inicializamos leyendo de localStorage
    const [showFinancialMetrics, setShowFinancialMetricsState] = useState(() => {
        const saved = localStorage.getItem("showFinancialMetrics");
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [loading, setLoading] = useState(true);

    // Cargar Configuración del Backend
    useEffect(() => {
        const load = async () => {
            try {
                const data = await GymApi.getPreferences();
                setAutoBirthday(data.envioAutomaticoCumpleanos);
                setAutoReceipts(data.envioAutomaticoRecibos);
            } catch (err) {
                console.error("Error cargando preferencias", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // --- HANDLERS DB ---
    const toggleBirthday = async (val: boolean) => {
        setAutoBirthday(val); // Optimistic UI
        try {
            await GymApi.updatePreferences({ envioAutomaticoCumpleanos: val });
        } catch (e) {
            setAutoBirthday(!val); // Revertir si falla
            showError("No se pudo actualizar");
        }
    };

    const toggleReceipts = async (val: boolean) => {
        setAutoReceipts(val);
        try {
            await GymApi.updatePreferences({ envioAutomaticoRecibos: val });
        } catch (e) {
            setAutoReceipts(!val);
            showError("No se pudo actualizar");
        }
    };

    // --- HANDLER LOCALSTORAGE (Sync entre pestañas) ---
    const setShowFinancialMetrics = (val: boolean) => {
        setShowFinancialMetricsState(val);
        localStorage.setItem("showFinancialMetrics", JSON.stringify(val));
        // Disparar evento para que otros componentes se enteren (ej: HistorialPagos)
        window.dispatchEvent(new Event("storage"));
    };

    return {
        loading,
        autoBirthday,
        autoReceipts,
        showFinancialMetrics,
        toggleBirthday,
        toggleReceipts,
        setShowFinancialMetrics
    };
};