import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../Auth/useAuthUser'; 
import { EjerciciosApi, type Ejercicio, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi';
import { showConfirmDelete, showError } from '../../Helpers/Alerts';
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

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
    const [imageUrl, setImageUrl] = useState<string | null>(null);

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
        if (!isAdmin) return showError("Solo administradores pueden eliminar.");
        const result = await showConfirmDelete(
                "¿Seguro que desea Eliminar este ejercicio?", 
                "Esta acción no se puede deshacer."
            );

        if (!result.isConfirmed) {
        return;}

        try {
            // Ahora se elimina tanto de la BD como de Cloudinary
            const ejercicio = ejercicios.find(e => e.id === id);
            
            await EjerciciosApi.delete(id); // Borrar de BD
            
            // BORRAR DE CLOUDINARY (Fire & Forget)
            if (ejercicio?.urlVideo) CloudinaryApi.delete(ejercicio.urlVideo, 'video');
            if (ejercicio?.imagenUrl) CloudinaryApi.delete(ejercicio.imagenUrl, 'image');

            setEjercicios(prev => prev.filter(e => e.id !== id));
        } catch (err: any) { 
            const mensajeBackend = err.response?.data?.message || err.response?.data?.error;
            showError(mensajeBackend || "Error al eliminar"); 
        }
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

    const saveEdit = async (id: number) => {
        setUploading(true);
        try {
            // Buscamos datos originales para saber qué borrar
            const original = ejercicios.find(e => e.id === id);

            let finalVideo = editForm.urlVideo;
            let finalImage = editForm.imagenUrl;

            const uploads = [];
            if (selectedVideo) {
                // BORRAR VIDEO VIEJO SI EXISTE
                if (original?.urlVideo) await CloudinaryApi.delete(original.urlVideo, 'video');
                
                uploads.push(CloudinaryApi.upload(selectedVideo, 'ejercicios', 'Ejercicios', 'video').then(u => finalVideo = u));
            }
            
            if (selectedImage) {
                // BORRAR IMAGEN VIEJA SI EXISTE
                if (original?.imagenUrl) await CloudinaryApi.delete(original.imagenUrl, 'image');

                uploads.push(CloudinaryApi.upload(selectedImage, 'ejercicios', 'Ejercicios', 'image').then(u => finalImage = u));
            }
            
            await Promise.all(uploads);

            const actualizado = await EjerciciosApi.update(id, { ...editForm, urlVideo: finalVideo, imagenUrl: finalImage });
            setEjercicios(prev => prev.map(e => (e.id === id ? actualizado : e)));
            cancelEdit();
        } catch (err: any) {
            showError(err.response?.data?.error || "Error al actualizar");
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