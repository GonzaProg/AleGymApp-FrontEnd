import { useState, useEffect } from "react";
import { EvolucionApi } from "../../API/Evoluciones/EvolucionApi"; 
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { showError, showSuccess, showConfirmDelete } from "../../Helpers/Alerts"; 

export type PosicionFoto = 'fotoPerfilIzquierdo' | 'fotoPerfilDerecho' | 'fotoFrontal' | 'fotoEspaldas';

export const useEvolucionCorporal = (currentUser: any) => {
    const [historial, setHistorial] = useState<any[]>([]);
    
    // Estados de Carga
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving, setSaving] = useState(false);
    const [updatingFoto, setUpdatingFoto] = useState<number | null>(null);
    
    // Estados para la UI
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
    const [mostrarTodos, setMostrarTodos] = useState(false); 
    const [todosCargados, setTodosCargados] = useState(false);

    // Formulario Medidas
    const [peso, setPeso] = useState("");
    const [cuello, setCuello] = useState("");
    const [hombros, setHombros] = useState("");
    const [pecho, setPecho] = useState("");
    const [bicep, setBicep] = useState("");
    const [antebrazo, setAntebrazo] = useState("");
    const [cintura, setCintura] = useState("");
    const [cadera, setCadera] = useState("");
    const [muslo, setMuslo] = useState("");
    const [pantorrilla, setPantorrilla] = useState("");

    // Formulario Fotos
    const [fotos, setFotos] = useState({
        fotoPerfilIzquierdo: { file: null as File | null, preview: null as string | null },
        fotoPerfilDerecho: { file: null as File | null, preview: null as string | null },
        fotoFrontal: { file: null as File | null, preview: null as string | null },
        fotoEspaldas: { file: null as File | null, preview: null as string | null },
    });

    const cargarHistorialInicial = async () => {
        setLoading(true);
        try {
            const data = await EvolucionApi.obtenerHistorial(5);
            setHistorial(data);
            if (data.length < 5) setTodosCargados(true);
        } catch (error) {
            console.error("Error cargando historial de evolución");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        cargarHistorialInicial(); 
    }, []);

    const handleVerTodos = async () => {
        if (mostrarTodos) {
            setMostrarTodos(false);
            return;
        }
        if (todosCargados) {
            setMostrarTodos(true);
            return;
        }
        setLoadingMore(true);
        try {
            const data = await EvolucionApi.obtenerHistorial();
            setHistorial(data);
            setTodosCargados(true);
            setMostrarTodos(true);
        } catch (error) {
            showError("No se pudieron cargar los registros antiguos.");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, position: PosicionFoto) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFotos(prev => ({
                ...prev,
                [position]: {
                    file: selected,
                    preview: URL.createObjectURL(selected)
                }
            }));
        }
    };

    const clearFile = (position: PosicionFoto) => {
        setFotos(prev => ({
            ...prev,
            [position]: { file: null, preview: null }
        }));
    };

    const resetForm = () => {
        setPeso(""); setCuello(""); setHombros(""); setPecho(""); 
        setBicep(""); setAntebrazo(""); setCintura(""); setCadera(""); 
        setMuslo(""); setPantorrilla("");
        setFotos({
            fotoPerfilIzquierdo: { file: null, preview: null },
            fotoPerfilDerecho: { file: null, preview: null },
            fotoFrontal: { file: null, preview: null },
            fotoEspaldas: { file: null, preview: null },
        });
        setIsFormOpen(false);
    };

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!peso || !pecho || !bicep || !cintura || !cadera || !muslo) {
            return showError("Por favor, ingresa todas las medidas obligatorias.");
        }

        setSaving(true);
        try {
            const customFolder = `EvolucionCorporal/Gym-${currentUser?.gym?.codigoAcceso}`;
            
            // Subir imágenes concurrentemente
            const uploadPromises = Object.entries(fotos).map(async ([key, data]) => {
                let url = null;
                if (data.file) {
                    url = await CloudinaryApi.upload(data.file, 'evolucion', customFolder, 'image');
                }
                return { [key]: url };
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const urlsObj = Object.assign({}, ...uploadedUrls);

            // Preparar payload limpiando los valores vacíos de las strings
            const parseNumber = (val: string) => val ? Number(val) : undefined;
            const payload = {
                peso: parseNumber(peso),
                cuello: parseNumber(cuello),
                hombros: parseNumber(hombros),
                pecho: parseNumber(pecho),
                bicep: parseNumber(bicep),
                antebrazo: parseNumber(antebrazo),
                cintura: parseNumber(cintura),
                cadera: parseNumber(cadera),
                muslo: parseNumber(muslo),
                pantorrilla: parseNumber(pantorrilla),
                ...urlsObj
            };

            await EvolucionApi.registrar(payload);
            
            showSuccess("¡Progreso guardado con éxito!");
            resetForm(); 
            
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
            const registro = historial.find(item => item.id === id);
            await EvolucionApi.eliminar(id);

            // Borrar fotos de cloudinary si existen
            const posiblesFotos = ['fotoPerfilIzquierdo', 'fotoPerfilDerecho', 'fotoFrontal', 'fotoEspaldas'];
            posiblesFotos.forEach(p => {
                if (registro && registro[p]) {
                    CloudinaryApi.delete(registro[p], 'image');
                }
            });

            setHistorial(prev => prev.filter(item => item.id !== id));
            showSuccess("Registro eliminado.");
        } catch (error) {
            showError("No se pudo eliminar el registro.");
        }
    };

    const handleChangeFotoExistente = async (registroId: number, file: File, posicion: PosicionFoto) => {
        setUpdatingFoto(registroId);
        try {
            const registro = historial.find(item => item.id === registroId);
            if (!registro) throw new Error("Registro no encontrado");

            // Si habia foto anterior, la borramos
            if (registro[posicion]) {
                await CloudinaryApi.delete(registro[posicion], 'image');
            }

            // Subimos la nueva
            const customFolder = `EvolucionCorporal/Gym-${currentUser?.gym?.codigoAcceso}`;
            const nuevaUrl = await CloudinaryApi.upload(file, 'evolucion', customFolder, 'image');

            // Actualizamos en BD
            const payload = { [posicion]: nuevaUrl };
            const response = await EvolucionApi.actualizar(registroId, payload);

            // Actualizamos estado local
            setHistorial(prev => prev.map(item => item.id === registroId ? { ...item, ...response.avance } : item));
            
            showSuccess("Foto actualizada correctamente.");
        } catch (error) {
            showError("Error al actualizar la foto.");
        } finally {
            setUpdatingFoto(null);
        }
    };

    return {
        historial, loading, loadingMore, saving, updatingFoto,
        peso, setPeso, cuello, setCuello, hombros, setHombros,
        pecho, setPecho, bicep, setBicep, antebrazo, setAntebrazo,
        cintura, setCintura, cadera, setCadera, muslo, setMuslo,
        pantorrilla, setPantorrilla,
        fotos, handleFileChange, clearFile,
        isFormOpen, setIsFormOpen, resetForm,
        fotoSeleccionada, setFotoSeleccionada,
        mostrarTodos, handleVerTodos, todosCargados,
        handleGuardar, handleEliminar, handleChangeFotoExistente
    };
};