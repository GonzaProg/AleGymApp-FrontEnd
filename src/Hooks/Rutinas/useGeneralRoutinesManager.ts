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

    // 4. Acción Asignar (Soporta grupos y rutinas individuales)
    const handleAsignar = async () => {
        if (!selectedRutina || !alumnoSeleccionado) return;

        const esGrupo = selectedRutina.esGrupo;
        const nombre = selectedRutina.nombreRutina;

        const confirm = await showConfirmSuccess(
            "¿Asignar Rutina?",
            esGrupo 
                ? `¿Vincular "${nombre}" (${selectedRutina.dias.length} días) a ${alumnoSeleccionado.nombre}?`
                : `¿Vincular la rutina "${nombre}" a ${alumnoSeleccionado.nombre}?`
        );

        if (!confirm.isConfirmed) return;

        try {
            if (esGrupo) {
                await RutinasApi.asignarGrupo(selectedRutina.grupoId, alumnoSeleccionado.id);
                showSuccess(`Rutina asignada a ${alumnoSeleccionado.nombre} (${selectedRutina.dias.length} días) ✅`);
            } else {
                await RutinasApi.asignarGeneral(selectedRutina.id, alumnoSeleccionado.id);
                showSuccess(`Rutina asignada a ${alumnoSeleccionado.nombre} ✅`);
            }
            setIsAssignModalOpen(false);
        } catch (error: any) {
            showError(error.response?.data?.error || "Error al asignar rutina");
        }
    };

    // 5. Eliminar Rutina General (Soporta grupos)
    const handleDelete = async (rutina: any) => {
        const esGrupo = rutina.esGrupo;
        const nombre = rutina.nombreRutina;

        const confirm = await showConfirmSuccess(
            esGrupo ? "¿Eliminar Rutina Multi-Día?" : "¿Eliminar Plantilla?",
            esGrupo 
                ? `Se eliminarán los ${rutina.dias.length} días de "${nombre}". Todos los alumnos asignados la perderán.`
                : `Se eliminará "${nombre}" de las rutinas generales. Todos los alumnos asignados la perderán.`
        );

        if (!confirm.isConfirmed) return;

        try {
            if (esGrupo) {
                await RutinasApi.deleteGrupo(rutina.grupoId);
            } else {
                await RutinasApi.delete(rutina.id);
            }
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