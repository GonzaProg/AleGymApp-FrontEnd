import { useState, useEffect } from "react";
import { EvolucionApi } from "../../API/Evoluciones/EvolucionApi";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";
import { showError, showSuccess, showConfirmDelete } from "../../Helpers/Alerts";

export const useEvolucionCorporal = (currentUser: any) => {
    const [historial, setHistorial] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Formulario
    const [peso, setPeso] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const cargarHistorial = async () => {
        setLoading(true);
        try {
            const data = await EvolucionApi.obtenerHistorial();
            setHistorial(data);
        } catch (error) {
            console.error("Error cargando historial de evolución");
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => { 
        cargarHistorial(); 
    }, []);

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

    const handleGuardar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!peso) return showError("Por favor, ingresa tu peso actual.");

        setSaving(true);
        try {
            let fotoUrl = "";
            if (file) {
                // Subimos a la carpeta específica del gym en Cloudinary
                const customFolder = `EvolucionCorporal/Gym-${currentUser?.gym?.codigoAcceso}`;
                fotoUrl = await CloudinaryApi.upload(file, 'evolucion', customFolder, 'image');
            }

            await EvolucionApi.registrar(Number(peso), fotoUrl);
            
            showSuccess("¡Progreso guardado con éxito!");
            setPeso("");
            clearFile();
            cargarHistorial(); 
        } catch (error) {
            console.error("Error al guardar:", error);
            showError("Error al guardar el progreso. Inténtalo de nuevo.");
        } finally { 
            setSaving(false); 
        }
    };

    const handleEliminar = async (id: number) => {
        // USAMOS TU FUNCIÓN DE SWEET ALERT
        const confirmacion = await showConfirmDelete(
            "¿Eliminar registro?",
            "Esta acción no se puede deshacer y borrará la foto asociada."
        );
        
        if (!confirmacion.isConfirmed) return; // Si cancela, cortamos acá
        
        try {
            // 1. Buscamos el registro original para saber si tenía foto ANTES de borrarlo
            const registroAEliminar = historial.find(item => item.id === id);

            // 2. Eliminamos de la base de datos
            await EvolucionApi.eliminar(id);

            // 3. Borramos de Cloudinary si existía la foto (Fire & Forget)
            if (registroAEliminar?.fotoUrl) {
                CloudinaryApi.delete(registroAEliminar.fotoUrl, 'image');
            }

            // 4. Actualizamos la vista quitando el item
            setHistorial(prev => prev.filter(item => item.id !== id));
            showSuccess("Registro eliminado correctamente.");
        } catch (error) {
            console.error("Error al eliminar:", error);
            showError("No se pudo eliminar el registro.");
        }
    };

    return {
        historial,
        loading,
        saving,
        peso,
        setPeso,
        preview,
        handleFileChange,
        clearFile,
        handleGuardar,
        handleEliminar
    };
};