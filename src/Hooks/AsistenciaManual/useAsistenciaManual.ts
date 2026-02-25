import { useState } from "react";
import { AsistenciaApi } from "../../API/Asistencias/AsistenciaApi";
import { showSuccess, showError } from "../../Helpers/Alerts";

export const useAsistenciaManual = () => {
    const [dni, setDni] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!dni) return showError("Ingresa un DNI");
        
        setLoading(true);
        try {
            await AsistenciaApi.registrarEntradaManual(dni);
            showSuccess("Asistencia registrada correctamente.");
            setDni(""); // Limpiamos el input después de un éxito
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || "Error al registrar la asistencia";
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return {
        dni,
        setDni,
        loading,
        handleGuardar
    };
};