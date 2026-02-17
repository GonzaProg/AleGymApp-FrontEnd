import { useState, useEffect } from "react";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";
import { useAuthUser } from "../Auth/useAuthUser";
import { useAlumnoSearch } from "../useAlumnoSearch";

export const useUserRoutinesManager = () => {
    // Datos
    const [rutinasAlumno, setRutinasAlumno] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Obtener usuario actual para permisos
    const { currentUser } = useAuthUser();

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

    // Cargar rutinas cuando se selecciona un alumno
    useEffect(() => {
        if (alumnoSeleccionado) {
            loadRutinasAlumno();
        } else {
            setRutinasAlumno([]);
        }
    }, [alumnoSeleccionado]);

    const loadRutinasAlumno = async () => {
        if (!alumnoSeleccionado) return;
        
        setLoading(true);
        try {
            const rutinas = await RutinasApi.getByUser(alumnoSeleccionado.id);
            setRutinasAlumno(rutinas);
        } catch (error) {
            console.error(error);
            showError("Error cargando rutinas del alumno");
        } finally {
            setLoading(false);
        }
    };

    // Determinar si una rutina se puede editar (solo las personales)
    const canEditRoutine = (rutina: any) => {
        // Si es general, no se puede editar aquí
        if (rutina.esGeneral) return false;
        
        // Si es personal y el usuario actual es entrenador/admin, puede editar
        return currentUser?.rol === 'Entrenador' || currentUser?.rol === 'Admin';
    };

    // Eliminar Rutina Personal
    const handleDelete = async (rutina: any) => {
        if (!canEditRoutine(rutina)) {
            showError("No tienes permisos para eliminar esta rutina");
            return;
        }

        const confirm = await showConfirmSuccess(
            "¿Eliminar Rutina Personal?",
            `Se eliminará "${rutina.nombreRutina}" permanentemente.`
        );

        if (!confirm.isConfirmed) return;

        try {
            await RutinasApi.delete(rutina.id);
            showSuccess("Rutina personal eliminada correctamente.");
            loadRutinasAlumno(); // Recargar las rutinas del alumno
        } catch (error) {
            showError("No se pudo eliminar la rutina.");
        }
    };

    return {
        rutinasAlumno,
        loading,
        busqueda,
        handleSearchChange,
        sugerencias,
        mostrarSugerencias,
        setMostrarSugerencias,
        handleSelectAlumno,
        alumnoSeleccionado,
        clearSelection,
        handleDelete,
        canEditRoutine
    };
};
