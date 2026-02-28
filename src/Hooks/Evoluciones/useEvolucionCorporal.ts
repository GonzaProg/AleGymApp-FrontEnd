import { useState, useEffect } from "react";
import { EvolucionApi } from "../../API/Evoluciones/EvolucionApi"; 
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { showError, showSuccess, showConfirmDelete } from "../../Helpers/Alerts"; 

export const useEvolucionCorporal = (currentUser: any) => {
    const [historial, setHistorial] = useState<any[]>([]);
    
    // Estados de Carga
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false); // Spinner para el botón "Ver todos"
    const [saving, setSaving] = useState(false);
    
    // Estados para la UI
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
    const [mostrarTodos, setMostrarTodos] = useState(false); 
    const [todosCargados, setTodosCargados] = useState(false); // <-- Bandera para no repetir peticiones

    // Formulario
    const [peso, setPeso] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // 1. CARGA INICIAL (Solo 5)
    const cargarHistorialInicial = async () => {
        setLoading(true);
        try {
            const data = await EvolucionApi.obtenerHistorial(5); // Trae solo 5
            setHistorial(data);
            if (data.length < 5) setTodosCargados(true); // Si hay menos de 5, ya no hay más para traer
        } catch (error) {
            console.error("Error cargando historial de evolución");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        cargarHistorialInicial(); 
    }, []);

    // 2. CARGA DE TODOS (Cuando aprieta el botón)
    const handleVerTodos = async () => {
        if (mostrarTodos) {
            // Si ya los está viendo, el botón funciona como "Ver menos"
            setMostrarTodos(false);
            return;
        }

        if (todosCargados) {
            // Si ya fue a la BD por todos, pero estaba en "Ver menos", solo expande visualmente
            setMostrarTodos(true);
            return;
        }

        // Si nunca trajo todos, va a la BD a buscarlos
        setLoadingMore(true);
        try {
            const data = await EvolucionApi.obtenerHistorial(); // Trae todos
            setHistorial(data);
            setTodosCargados(true);
            setMostrarTodos(true);
        } catch (error) {
            console.error("Error trayendo todos los registros");
            showError("No se pudieron cargar los registros antiguos.");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
    };

    const resetForm = () => {
        setPeso("");
        clearFile();
        setIsFormOpen(false);
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!peso) return showError("Por favor, ingresa tu peso actual.");

        setSaving(true);
        try {
            let fotoUrl = "";
            if (file) {
                const customFolder = `EvolucionCorporal/Gym-${currentUser?.gym?.codigoAcceso}`;
                fotoUrl = await CloudinaryApi.upload(file, 'evolucion', customFolder, 'image');
            }

            await EvolucionApi.registrar(Number(peso), fotoUrl);
            
            showSuccess("¡Progreso guardado con éxito!");
            resetForm(); 
            
            // Si ya había cargado todos, traemos todos de nuevo. Si no, traemos los 5.
            if (todosCargados) {
                const data = await EvolucionApi.obtenerHistorial();
                setHistorial(data);
            } else {
                cargarHistorialInicial();
            }
        } catch (error) {
            console.error("Error al guardar evolución:", error);
            showError("Error al guardar el progreso. Inténtalo de nuevo.");
        } finally { 
            setSaving(false); 
        }
    };

    const handleEliminar = async (id: number) => {
        const confirmacion = await showConfirmDelete("¿Eliminar registro?", "Esta acción no se puede deshacer.");
        if (!confirmacion.isConfirmed) return;
        
        try {
            const registroAEliminar = historial.find(item => item.id === id);
            await EvolucionApi.eliminar(id);
            if (registroAEliminar?.fotoUrl) CloudinaryApi.delete(registroAEliminar.fotoUrl, 'image');

            setHistorial(prev => prev.filter(item => item.id !== id));
            showSuccess("Registro eliminado.");
        } catch (error) {
            showError("No se pudo eliminar el registro.");
        }
    };

    return {
        historial, loading, loadingMore, saving,
        peso, setPeso,
        preview, handleFileChange, clearFile,
        isFormOpen, setIsFormOpen, resetForm,
        fotoSeleccionada, setFotoSeleccionada,
        mostrarTodos, handleVerTodos, todosCargados,
        handleGuardar, handleEliminar
    };
};