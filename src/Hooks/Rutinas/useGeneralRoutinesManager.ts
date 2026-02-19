import { useState, useEffect } from "react";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useGeneralRoutinesManager = () => {
    // Datos
    const [rutinas, setRutinas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Buscador y Modal
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRutina, setSelectedRutina] = useState<any | null>(null);

    // Usamos el hook centralizado para la búsqueda de alumnos
    const {
        busqueda,
        sugerencias,
        mostrarSugerencias,
        alumnoSeleccionado,
        handleSearchChange,
        handleSelectAlumno,
        setMostrarSugerencias,
        clearSelection
    } = useAlumnoSearch({ initialLoad: true });

    // 1. Carga Inicial
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const dataRutinas = await RutinasApi.getGenerales();
            setRutinas(dataRutinas);
        } catch (error) {
            console.error(error);
            showError("Error cargando rutinas generales");
        } finally {
            setLoading(false);
        }
    };

    // 3. Abrir Modal Asignar
    const openAssignModal = (rutina: any) => {
        setSelectedRutina(rutina);
        clearSelection();
        setIsAssignModalOpen(true);
    };

    // 4. Acción Asignar
    const handleAsignar = async () => {
        if (!selectedRutina || !alumnoSeleccionado) return;

        const confirm = await showConfirmSuccess(
            "¿Asignar Rutina?",
            `¿Vincular la rutina "${selectedRutina.nombreRutina}" a ${alumnoSeleccionado.nombre}?`
        );

        if (!confirm.isConfirmed) return;

        try {
            await RutinasApi.asignarGeneral(selectedRutina.id, alumnoSeleccionado.id);
            showSuccess(`Rutina asignada a ${alumnoSeleccionado.nombre} ✅`);
            setIsAssignModalOpen(false);
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al asignar rutina");
        }
    };

    // 5. Eliminar Rutina General
    const handleDelete = async (rutina: any) => {
        const confirm = await showConfirmSuccess(
            "¿Eliminar Plantilla?",
            `Se eliminará "${rutina.nombreRutina}" de las rutinas generales. Todos los alumnos asignados la perderán.`
        );

        if (!confirm.isConfirmed) return;

        try {
            await RutinasApi.delete(rutina.id);
            showSuccess("Plantilla eliminada.");
            loadData();
        } catch (error) {
            showError("No se pudo eliminar.");
        }
    };

    return {
        rutinas,
        loading,
        // Modal
        isAssignModalOpen,
        setIsAssignModalOpen,
        openAssignModal,
        selectedRutina,
        // Buscador
        busqueda,
        handleSearchChange,
        sugerencias,
        mostrarSugerencias,
        setMostrarSugerencias,
        handleSelectAlumno,
        alumnoSeleccionado,
        // Acciones
        handleAsignar,
        handleDelete
    };
};