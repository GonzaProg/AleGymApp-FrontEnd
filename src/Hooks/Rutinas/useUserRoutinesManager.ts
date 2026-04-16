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

    // Determinar si una rutina se puede editar (solo las personales individuales)
    const canEditRoutine = (rutina: any) => {
        // Si es grupo, no se puede editar aquí (por ahora)
        if (rutina.esGrupo) return false;
        // Si es general, no se puede editar aquí
        if (rutina.esGeneral) return false;
        
        // Si es personal y el usuario actual es entrenador/admin, puede editar
        return currentUser?.rol === 'Entrenador' || currentUser?.rol === 'Admin';
    };

    // Eliminar Rutina Personal (Soporta grupos)
    const handleDelete = async (rutina: any) => {
        if (!canEditRoutine(rutina) && !rutina.esGrupo) {
            showError("No tienes permisos para eliminar esta rutina");
            return;
        }

        const esGrupo = rutina.esGrupo;
        const nombre = rutina.nombreRutina;

        const confirm = await showConfirmSuccess(
            esGrupo ? "¿Eliminar Rutina Multi-Día?" : "¿Eliminar Rutina Personal?",
            esGrupo 
                ? `Se eliminarán los ${rutina.dias.length} días de "${nombre}" permanentemente.`
                : `Se eliminará "${nombre}" permanentemente.`
        );

        if (!confirm.isConfirmed) return;

        try {
            if (esGrupo) {
                await RutinasApi.deleteGrupo(rutina.grupoId);
            } else {
                await RutinasApi.delete(rutina.id);
            }
            showSuccess(esGrupo ? "Rutina multi-día eliminada correctamente." : "Rutina personal eliminada correctamente.");
            loadRutinasAlumno(); // Recargar las rutinas del alumno
        } catch (error) {
            showError("No se pudo eliminar la rutina.");
        }
    };

    // Desvincular Rutina General (Soporta grupos)
    const handleUnlink = async (rutina: any) => {
        if (!alumnoSeleccionado) {
            showError("No hay alumno seleccionado");
            return;
        }

        const esGrupo = rutina.esGrupo;
        const nombre = rutina.nombreRutina;

        const confirm = await showConfirmSuccess(
            esGrupo ? "¿Desvincular Rutina Multi-Día?" : "¿Desvincular Rutina General?",
            esGrupo 
                ? `Se desvincularán los ${rutina.dias.length} días de "${nombre}" del alumno ${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}.`
                : `Se desvinculará "${nombre}" del alumno ${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}.`
        );

        if (!confirm.isConfirmed) return;

        try {
            if (esGrupo) {
                await RutinasApi.desvincularGrupo(rutina.grupoId, alumnoSeleccionado.id);
            } else {
                await RutinasApi.desvincularGeneral(rutina.id, alumnoSeleccionado.id);
            }
            showSuccess(esGrupo ? "Rutina multi-día desvinculada correctamente." : "Rutina general desvinculada correctamente.");
            loadRutinasAlumno(); // Recargar las rutinas del alumno
        } catch (error) {
            showError("No se pudo desvincular la rutina.");
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
        handleUnlink,
        canEditRoutine
    };
};
