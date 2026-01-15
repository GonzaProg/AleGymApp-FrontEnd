import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../useAuthUser'; 
import { EjerciciosApi, type Ejercicio, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

export const useEjerciciosGestion = () => {
    const { isAdmin, isEntrenador } = useAuthUser(); 
    const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Edición
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<EjercicioDTO>({ nombre: '', urlVideo: '', imagenUrl: '' });

    // Archivos seleccionados en edición
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    // Modals
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null); // Nuevo Modal Imagen

    const fetchEjercicios = useCallback(async () => {
        setLoading(true);
        try {
            const data = await EjerciciosApi.getAll();
            setEjercicios(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchEjercicios(); }, [fetchEjercicios]);

    const handleDelete = async (id: number) => {
        if (!isAdmin) return alert("Solo administradores pueden eliminar.");
        if (!window.confirm("¿Eliminar ejercicio?")) return;
        try {
            await EjerciciosApi.delete(id);
            setEjercicios(prev => prev.filter(e => e.id !== id));
        } catch (err: any) { alert("Error al eliminar"); }
    };

    const startEdit = (ej: Ejercicio) => {
        if (!isAdmin && !isEntrenador) return;
        setEditingId(ej.id);
        setEditForm({ nombre: ej.nombre, urlVideo: ej.urlVideo || '', imagenUrl: ej.imagenUrl || '' });
        setSelectedVideo(null);
        setSelectedImage(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ nombre: '', urlVideo: '', imagenUrl: '' });
        setSelectedVideo(null);
        setSelectedImage(null);
    };

    const uploadToCloudinary = async (file: File, type: 'video' | 'image'): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.secure_url;
    };

    const saveEdit = async (id: number) => {
        setUploading(true);
        try {
            let finalVideo = editForm.urlVideo;
            let finalImage = editForm.imagenUrl;

            const uploads = [];
            if (selectedVideo) uploads.push(uploadToCloudinary(selectedVideo, 'video').then(u => finalVideo = u));
            if (selectedImage) uploads.push(uploadToCloudinary(selectedImage, 'image').then(u => finalImage = u));
            
            await Promise.all(uploads);

            const actualizado = await EjerciciosApi.update(id, { ...editForm, urlVideo: finalVideo, imagenUrl: finalImage });
            setEjercicios(prev => prev.map(e => (e.id === id ? actualizado : e)));
            cancelEdit();
        } catch (err: any) {
            alert(err.response?.data?.error || "Error al actualizar");
        } finally {
            setUploading(false);
        }
    };

    const handleEditInputChange = (field: keyof EjercicioDTO, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setSelectedVideo(e.target.files[0]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setSelectedImage(e.target.files[0]);
    };

    return {
        ejercicios, loading, uploading, isAdmin,
        editingId, editForm, 
        selectedVideo, selectedImage,
        videoUrl, imageUrl, // Exportamos estados de modales
        setVideoUrl, setImageUrl, // Setters para abrir/cerrar
        handleDelete, startEdit, cancelEdit, saveEdit, handleEditInputChange,
        handleVideoChange, handleImageChange,
        refetch: fetchEjercicios
    };
};