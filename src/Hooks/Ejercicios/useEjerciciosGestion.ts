import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../useAuthUser'; 
import { EjerciciosApi, type Ejercicio, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

export const useEjerciciosGestion = () => {
    const { isAdmin, isEntrenador } = useAuthUser(); 
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para Edición
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<EjercicioDTO>({ nombre: '', urlVideo: '' });

    // Estados para subida de video
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    //  Estado para el Visor de Video 
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // 1. Cargar Ejercicios
    const fetchEjercicios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await EjerciciosApi.getAll();
            setEjercicios(data);
        } catch (err) {
            console.error("Error al cargar ejercicios", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEjercicios();
    }, [fetchEjercicios]);

    // 2. Eliminar
    const handleDelete = async (id: number) => {
        if (!isAdmin) return alert("Solo administradores pueden eliminar.");
        if (!window.confirm("¿Seguro que deseas eliminar este ejercicio?")) return;
        try {
            await EjerciciosApi.delete(id);
            setEjercicios(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            const mensajeBackend = err.response?.data?.message || err.response?.data?.error;
            alert(mensajeBackend || "Error al eliminar");
        }
    };

    // 3. Edición
    const startEdit = (ejercicio: Ejercicio) => {
        if (!isAdmin && !isEntrenador) return;
        setEditingId(ejercicio.id);
        setEditForm({ nombre: ejercicio.nombre, urlVideo: ejercicio.urlVideo || '' });
        setSelectedFile(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ nombre: '', urlVideo: '' });
        setSelectedFile(null);
    };

    const uploadVideoToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, 
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            if (!res.ok) throw new Error("Error al subir video");
            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary Error:", error);
            throw error;
        }
    };

    const saveEdit = async (id: number) => {
        setUploading(true);
        try {
            let finalUrl = editForm.urlVideo;
            if (selectedFile) {
                finalUrl = await uploadVideoToCloudinary(selectedFile);
            }
            const actualizado = await EjerciciosApi.update(id, { 
                ...editForm, 
                urlVideo: finalUrl 
            });
            setEjercicios(prev => prev.map(e => (e.id === id ? actualizado : e)));
            setEditingId(null);
            setSelectedFile(null);
        } catch (err: any) {
            alert(err.response?.data?.error || "Error al actualizar");
        } finally {
            setUploading(false);
        }
    };

    const handleEditInputChange = (field: keyof EjercicioDTO, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Funciones para abrir/cerrar Modal de Video 
    const handleOpenVideo = (url: string) => {
        if (url) setVideoUrl(url);
    };

    const closeVideo = () => {
        setVideoUrl(null);
    };

    return {
        ejercicios,
        loading,
        uploading,
        isAdmin,
        editingId,
        editForm,
        selectedFile,
        videoUrl, 
        handleOpenVideo,
        closeVideo,
        handleDelete,
        startEdit,
        cancelEdit,
        saveEdit,
        handleEditInputChange,
        handleFileChange,
        refetch: fetchEjercicios
    };
};