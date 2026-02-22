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

    const [ejercicioSearch, setEjercicioSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

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

    useEffect(() => {
        PersonalRecordApi.getNombresEjercicios().then(setEjercicios).catch(console.error);
        cargarDatos();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => cargarDatos(busqueda), 500);
        return () => clearTimeout(delay);
    }, [busqueda]);

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
        setEjercicioSearch(""); 
        setShowDropdown(false);
    };

    const handleSave = async () => {
        if (!ejercicioId || !peso) return showError("Ejercicio y peso son obligatorios");
        setLoading(true);

        try {
            let finalVideoUrl = oldVideoUrl;

            if (videoFile) {
                const customFolder = currentUser?.gym?.codigoAcceso 
                    ? `PRs/Gym_${currentUser.gym.codigoAcceso}` 
                    : 'PRs/General';

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

        } catch (error: any) {
            console.error("Detalle del error:", error);
            // Capturamos el error exacto que mande el backend (por si es el de duplicado)
            const errorMsg = error.response?.data?.error || "Error al guardar el PR";
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pr: any) => {
        setEditandoId(pr.id);
        setEjercicioId(pr.ejercicio.id.toString());
        setEjercicioSearch(pr.ejercicio.nombre); 
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

    // --- LÓGICA DE VALIDACIÓN Y DUPLICIDAD ---
    const prExistente = !editandoId ? prs.find(p => p.ejercicio.id.toString() === ejercicioId) : null;
    const esDuplicado = !!prExistente;

    let isSaveDisabled = false;
    if (loading || !ejercicioId || !peso || esDuplicado) {
        isSaveDisabled = true;
    } else if (editandoId) {
        const originalPR = prs.find(p => p.id === editandoId);
        if (originalPR) {
            const sinCambioEjercicio = ejercicioId === originalPR.ejercicio.id.toString();
            const sinCambioPeso = peso === originalPR.peso.toString();
            const sinCambioVideo = videoFile === null; 

            if (sinCambioEjercicio && sinCambioPeso && sinCambioVideo) {
                isSaveDisabled = true; 
            }
        }
    }

    return {
        prs, ejercicios, busqueda, loading,
        ejercicioId, peso, videoPreview, editandoId, fileInputRef, videoSeleccionado, isFormOpen,
        ejercicioSearch, showDropdown, isSaveDisabled, esDuplicado, prExistente, // <-- Añadimos los de duplicidad
        
        setBusqueda, setEjercicioId, setPeso, setVideoSeleccionado,
        setEjercicioSearch, setShowDropdown,
        
        handleFileChange, handleSave, handleEdit, handleDelete, resetForm, setIsFormOpen
    };
};