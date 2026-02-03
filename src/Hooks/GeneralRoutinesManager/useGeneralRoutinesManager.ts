import { useState, useEffect } from "react";
import { RutinasApi } from "../../API/Rutinas/RutinasApi";
import { UsuarioApi } from "../../API/Usuarios/UsuarioApi";
import { showSuccess, showError, showConfirmSuccess } from "../../Helpers/Alerts";

export const useGeneralRoutinesManager = () => {
    // Datos
    const [rutinas, setRutinas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<any[]>([]);

    // Buscador y Modal
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRutina, setSelectedRutina] = useState<any | null>(null);
    
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<any[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);

    // 1. Carga Inicial
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [dataRutinas, dataAlumnos] = await Promise.all([
                RutinasApi.getGenerales(),
                UsuarioApi.getAlumnos()
            ]);
            setRutinas(dataRutinas);
            setTodosLosAlumnos(dataAlumnos);
        } catch (error) {
            console.error(error);
            showError("Error cargando rutinas generales");
        } finally {
            setLoading(false);
        }
    };

    // 2. Lógica Buscador (Reutilizada)
    const handleSearchChange = (text: string) => {
        setBusqueda(text);
        if (text.length > 0) {
            const filtrados = todosLosAlumnos.filter((u) => 
                `${u.nombre} ${u.apellido}`.toLowerCase().includes(text.toLowerCase())
            );
            setSugerencias(filtrados);
            setMostrarSugerencias(true);
        } else {
            setSugerencias([]);
            setMostrarSugerencias(false);
            setAlumnoSeleccionado(null);
        }
    };

    const handleSelectAlumno = (alumno: any) => {
        setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
        setAlumnoSeleccionado(alumno);
        setMostrarSugerencias(false);
    };

    // 3. Abrir Modal Asignar
    const openAssignModal = (rutina: any) => {
        setSelectedRutina(rutina);
        setBusqueda("");
        setAlumnoSeleccionado(null);
        setSugerencias([]);
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