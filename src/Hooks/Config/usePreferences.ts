import { useState, useEffect } from "react";
import { GymApi } from "../../API/Gym/GymApi";
import { showError, showSuccess } from "../../Helpers/Alerts";

export const usePreferences = () => {
    // DB Settings
    const [autoBirthday, setAutoBirthday] = useState(true);
    const [autoReceipts, setAutoReceipts] = useState(true);
    const [birthdayMessage, setBirthdayMessage] = useState("");
    const [moduloAsistencia, setModuloAsistencia] = useState(true);
    
    // LocalStorage Settings (Métricas)
    // Inicializamos leyendo de localStorage
    const [showFinancialMetrics, setShowFinancialMetricsState] = useState(() => {
        const saved = localStorage.getItem("showFinancialMetrics");
        return saved !== null ? JSON.parse(saved) : false;
    });

    const [loading, setLoading] = useState(true);
    const [savingMessage, setSavingMessage] = useState(false);

    // Cargar Configuración del Backend
    useEffect(() => {
        const load = async () => {
            try {
                const data = await GymApi.getPreferences();
                setAutoBirthday(data.envioAutomaticoCumpleanos);
                setAutoReceipts(data.envioAutomaticoRecibos);
                setBirthdayMessage(data.mensajeCumpleanos || "");
                setModuloAsistencia(data.moduloAsistencia ?? true);
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

    const toggleAsistencia = async (val: boolean) => {
        setModuloAsistencia(val); 
        try {
            await GymApi.updatePreferences({ moduloAsistencia: val });
            
            // --- EL TRUCO ESTÁ AQUÍ: Actualizamos la "memoria" del navegador ---
            const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
            const userStr = storage.getItem("user");

            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.gym) {
                    user.gym.moduloAsistencia = val; // Sobreescribimos con el nuevo valor
                    storage.setItem("user", JSON.stringify(user)); // Lo guardamos de nuevo
                }
            }

            showSuccess(`Módulo de asistencia ${val ? 'activado' : 'desactivado'}. Actualizando vista...`);

            // Recargamos la pestaña automáticamente después de 1 segundo para que el menú lateral desaparezca/aparezca
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (e) {
            setModuloAsistencia(!val); 
            showError("No se pudo actualizar el módulo");
        }
    };

    // --- HANDLER LOCALSTORAGE (Sync entre pestañas) ---
    const setShowFinancialMetrics = (val: boolean) => {
        setShowFinancialMetricsState(val);
        localStorage.setItem("showFinancialMetrics", JSON.stringify(val));
        // Disparar evento para que otros componentes se enteren (ej: HistorialPagos)
        window.dispatchEvent(new Event("storage"));
    };

    // --- HANDLER PARA EL MENSAJE ---
    const saveBirthdayMessage = async () => {
        setSavingMessage(true);
        try {
            await GymApi.updatePreferences({ mensajeCumpleanos: birthdayMessage });
            showSuccess("Mensaje de cumpleaños actualizado ✅");
        } catch (error) {
            showError("No se pudo guardar el mensaje");
        } finally {
            setSavingMessage(false);
        }
    };

    return {
        loading,
        savingMessage, 
        autoBirthday,
        autoReceipts,
        birthdayMessage, 
        setBirthdayMessage, 
        saveBirthdayMessage, 
        toggleBirthday,
        toggleReceipts,
        showFinancialMetrics,
        setShowFinancialMetrics,
        moduloAsistencia, toggleAsistencia
    };
};