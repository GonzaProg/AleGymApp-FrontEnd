import { useState, useEffect } from "react";
import { ActividadCardioApi } from "../../API/ActividadCardio/ActividadCardioApi";
import { useAuthUser } from "../Auth/useAuthUser";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useActividadCardio = () => {
    const { currentUser: user } = useAuthUser();
    const gym = user?.gym;
    const [historial, setHistorial] = useState<any[]>([]);
    const [estadisticas, setEstadisticas] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const cargarHistorial = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const [histData, statsData] = await Promise.all([
                ActividadCardioApi.obtenerHistorial(user.id),
                ActividadCardioApi.obtenerEstadisticas(user.id)
            ]);
            setHistorial(histData);
            setEstadisticas(statsData);
        } catch (error) {
            console.error("Error cargando historial de cardio", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarHistorial();
    }, [user]);

    const registrarActividad = async (datos: any) => {
        if (!user?.id || !gym?.id) return;
        try {
            await ActividadCardioApi.registrarActividad(gym.id, user.id, datos);
            showSuccess("Actividad registrada correctamente");
            cargarHistorial();
            return true;
        } catch (error) {
            console.error("Error al registrar actividad", error);
            showError("No se pudo registrar la actividad");
            return false;
        }
    };

    const eliminarActividad = async (actividadId: number) => {
        if (!user?.id) return;
        try {
            await ActividadCardioApi.eliminarActividad(user.id, actividadId);
            setHistorial(prev => prev.filter(a => a.id !== actividadId));
        } catch (error) {
            console.error("Error eliminando actividad", error);
            showError("No se pudo eliminar");
        }
    };

    return {
        historial,
        estadisticas,
        loading,
        registrarActividad,
        eliminarActividad
    };
};
