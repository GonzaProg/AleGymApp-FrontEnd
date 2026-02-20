import { useState, useEffect, useRef } from "react";
import { PersonalRecordApi } from "../../API/PersonalRecords/PersonalRecordApi";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { showSuccess, showError, showConfirmDelete } from "../../Helpers/Alerts";
import { useAuthUser } from "../Auth/useAuthUser";

export const usePersonalRecords = () => {
    // Estados de Listas
    const [prs, setPrs] = useState<any[]>([]);
    const [ejercicios, setEjercicios] = useState<any[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Estados de Formulario
    const [ejercicioId, setEjercicioId] = useState("");
    const [peso, setPeso] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [oldVideoUrl, setOldVideoUrl] = useState<string | null>(null);

    const [videoSeleccionado, setVideoSeleccionado] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { currentUser } = useAuthUser();

    const cargarDatos = async (searchTerm = "") => {
        try {
            const data = await PersonalRecordApi.getMyPRs(searchTerm ? undefined : 5, searchTerm);
            setPrs(data);
        } catch (error) {
            console.error("Error al cargar PRs");
        }
    };

    // Carga inicial
    useEffect(() => {
        PersonalRecordApi.getNombresEjercicios().then(setEjercicios).catch(console.error);
        cargarDatos();
    }, []);

    // Buscador con debounce
    useEffect(() => {
        const delay = setTimeout(() => cargarDatos(busqueda), 500);
        return () => clearTimeout(delay);
    }, [busqueda]);

    // Manejadores (Handlers)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 50 * 1024 * 1024) { 
                showError("El video es muy pesado (Max 50MB)");
                return;
            }
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setEditandoId(null);
        setEjercicioId("");
        setPeso("");
        setVideoFile(null);
        setVideoPreview(null);
        setOldVideoUrl(null);
        setIsFormOpen(false);
    };

    const handleSave = async () => {
        if (!ejercicioId || !peso) return showError("Ejercicio y peso son obligatorios");
        setLoading(true);

        try {
            let finalVideoUrl = oldVideoUrl;

            // ARMAMOS LA CARPETA DINÁMICA
            if (videoFile) {
                // Genera una ruta tipo: "PRs/Gym_1"
                const customFolder = currentUser?.gym?.codigoAcceso 
                    ? `PRs/Gym_${currentUser.gym.codigoAcceso}` 
                    : 'PRs/General';

                // Le pasamos el customFolder a Cloudinary
                finalVideoUrl = await CloudinaryApi.upload(videoFile, 'prs', customFolder, 'video');
            }

            if (editandoId) {
                await PersonalRecordApi.update(editandoId, Number(peso), finalVideoUrl || undefined, oldVideoUrl || undefined);
                showSuccess("PR Actualizado");
            } else {
                await PersonalRecordApi.create(Number(ejercicioId), Number(peso), finalVideoUrl || undefined);
                showSuccess("¡Nuevo PR Registrado! 🏆");
            }

            resetForm();
            cargarDatos();

        } catch (error) {
            console.error("Detalle del error:", error);
            showError("Error al guardar el PR");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pr: any) => {
        setEditandoId(pr.id);
        setEjercicioId(pr.ejercicio.id.toString());
        setPeso(pr.peso.toString());
        setOldVideoUrl(pr.videoUrl);
        setVideoPreview(pr.videoUrl);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (prId: number, videoUrl: string) => {
        const conf = await showConfirmDelete("¿Borrar este PR?", "No podrás recuperarlo.");
        if (conf.isConfirmed) {
            try {
                await PersonalRecordApi.delete(prId, videoUrl);
                showSuccess("PR eliminado");
                cargarDatos();
            } catch (error) {
                showError("Error al eliminar");
            }
        }
    };

    return {
        // Estado exportado
        prs, ejercicios, busqueda, loading,
        ejercicioId, peso, videoPreview, editandoId, fileInputRef, videoSeleccionado, isFormOpen,
        
        // Mutadores de estado directo
        setBusqueda, setEjercicioId, setPeso, setVideoSeleccionado,
        
        // Funciones / Handlers
        handleFileChange, handleSave, handleEdit, handleDelete, resetForm, setIsFormOpen
    };
};