import { useState, useEffect } from "react";
import { UsuarioApi, type AlumnoDTO, type GetAlumnosResponse } from "../API/Usuarios/UsuarioApi";

interface UseAlumnoSearchOptions {
    includePlan?: boolean;
    debounceMs?: number;
    minSearchLength?: number;
    initialLoad?: boolean;
}

interface UseAlumnoSearchReturn {
    // Estados
    busqueda: string;
    sugerencias: AlumnoDTO[];
    mostrarSugerencias: boolean;
    alumnoSeleccionado: AlumnoDTO | null;
    todosLosAlumnos: AlumnoDTO[];
    loading: boolean;
    
    // Acciones
    setBusqueda: (text: string) => void;
    setMostrarSugerencias: (show: boolean) => void;
    handleSearchChange: (text: string) => void;
    handleSelectAlumno: (alumno: AlumnoDTO) => void;
    clearSelection: () => void;
    refreshAlumnos: () => Promise<void>;
}

export const useAlumnoSearch = (options: UseAlumnoSearchOptions = {}): UseAlumnoSearchReturn => {
    const {
        includePlan = false,
        debounceMs = 500,
        minSearchLength = 2,
        initialLoad = false
    } = options;

    // Estados
    const [busqueda, setBusqueda] = useState("");
    const [sugerencias, setSugerencias] = useState<AlumnoDTO[]>([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<AlumnoDTO | null>(null);
    const [todosLosAlumnos, setTodosLosAlumnos] = useState<AlumnoDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Carga inicial de todos los alumnos (si se solicita)
    useEffect(() => {
        if (initialLoad) {
            refreshAlumnos();
        }
    }, [initialLoad]);

    // Búsqueda remota con debounce
    useEffect(() => {
        // Si está vacío o es muy corto, limpiamos y no buscamos
        if (busqueda.length < minSearchLength) {
            setSugerencias([]);
            setMostrarSugerencias(false);
            return;
        }

        // Si ya seleccionamos un alumno, no buscamos de nuevo
        if (alumnoSeleccionado && 
            `${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}`.toLowerCase() === busqueda.toLowerCase()) {
            return;
        }

        // Creamos un temporizador (debounce)
        const delayDebounceFn = setTimeout(async () => {
            try {
                setLoading(true);
                // Llamamos a la API pidiendo buscar por el texto escrito
                const data: GetAlumnosResponse = await UsuarioApi.getAlumnos({ 
                    search: busqueda, 
                    includePlan,
                    showAll: false // Solo traemos los primeros que coincidan
                });
                setSugerencias(data.alumnos);
                setMostrarSugerencias(true);
            } catch (error) {
                console.error("Error buscando alumnos", error);
                setSugerencias([]);
            } finally {
                setLoading(false);
            }
        }, debounceMs);

        // Limpieza: Si el usuario escribe antes del debounce, cancelamos la búsqueda anterior
        return () => clearTimeout(delayDebounceFn);

    }, [busqueda, minSearchLength, debounceMs, includePlan, alumnoSeleccionado]);

    // Handlers
    const handleSearchChange = (text: string) => {
        setBusqueda(text);
        // Si el usuario borra y escribe algo nuevo, reseteamos la selección
        if (alumnoSeleccionado && text !== `${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido}`) {
            setAlumnoSeleccionado(null);
        }
    };

    const handleSelectAlumno = (alumno: AlumnoDTO) => {
        setBusqueda(`${alumno.nombre} ${alumno.apellido}`);
        setAlumnoSeleccionado(alumno);
        setMostrarSugerencias(false);
    };

    const clearSelection = () => {
        setBusqueda("");
        setAlumnoSeleccionado(null);
        setSugerencias([]);
        setMostrarSugerencias(false);
    };

    const refreshAlumnos = async () => {
        try {
            setLoading(true);
            const data: GetAlumnosResponse = await UsuarioApi.getAlumnos({ 
                includePlan, 
                showAll: true 
            });
            setTodosLosAlumnos(data.alumnos);
        } catch (error) {
            console.error("Error cargando todos los alumnos", error);
            setTodosLosAlumnos([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        // Estados
        busqueda,
        sugerencias,
        mostrarSugerencias,
        alumnoSeleccionado,
        todosLosAlumnos,
        loading,
        
        // Acciones
        setBusqueda,
        setMostrarSugerencias,
        handleSearchChange,
        handleSelectAlumno,
        clearSelection,
        refreshAlumnos
    };
};
