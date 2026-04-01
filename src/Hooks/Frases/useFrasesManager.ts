import { useState, useEffect, useCallback } from 'react';
import { useAuthUser } from '../Auth/useAuthUser';
import { FrasesApi, type FraseMotivacion, type FraseMotivacionDTO } from '../../API/Frases/FrasesApi';
import { showConfirmDelete, showError } from '../../Helpers/Alerts';
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

export const useFrasesManager = () => {
    const { isAdmin } = useAuthUser();
    const [frases, setFrases] = useState<FraseMotivacion[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Edición / Creación
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<FraseMotivacionDTO>({ texto: '', imagenUrl: '' });
    
    // Archivo de imagen seleccionado
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    
    // Modal para previsualizar imagen (opcional)
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const fetchFrases = useCallback(async () => {
        setLoading(true);
        try {
            const data = await FrasesApi.getAll();
            setFrases(data);
        } catch (err: any) { 
            console.error("Error cargando frases", err); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => {
        if (isAdmin) {
            fetchFrases();
        }
    }, [isAdmin, fetchFrases]);

    const handleDelete = async (id: number) => {
        if (!isAdmin) return showError("Solo administradores pueden eliminar.");
        const result = await showConfirmDelete(
            "¿Seguro que desea Eliminar esta frase?", 
            "Esta acción no se puede deshacer."
        );

        if (!result.isConfirmed) return;

        try {
            const frase = frases.find(f => f.id === id);
            await FrasesApi.delete(id);
            
            // BORRAR IMAGEN DE CLOUDINARY (Fire & Forget)
            if (frase?.imagenUrl) {
                CloudinaryApi.delete(frase.imagenUrl, 'image');
            }

            setFrases(prev => prev.filter(f => f.id !== id));
        } catch (err: any) { 
            const mensajeBackend = err.response?.data?.error || err.response?.data?.message;
            showError(mensajeBackend || "Error al eliminar la frase"); 
        }
    };

    const startEdit = (frase?: FraseMotivacion) => {
        if (!isAdmin) return;
        if (frase) {
            setEditingId(frase.id);
            setEditForm({ texto: frase.texto, imagenUrl: frase.imagenUrl || '' });
        } else {
            setEditingId(-1); // Usamos -1 para indicar "Nueva"
            setEditForm({ texto: '', imagenUrl: '' });
        }
        setSelectedImage(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ texto: '', imagenUrl: '' });
        setSelectedImage(null);
    };

    const saveEdit = async () => {
        if (!editForm.texto.trim()) return showError("El texto es obligatorio.");
        setUploading(true);
        try {
            let finalImage = editForm.imagenUrl;
            
            // Subir nueva imagen si hay (usando el preset ejercicios, carpeta Frases)
            if (selectedImage) {
                if (editingId && editingId !== -1) {
                    const original = frases.find(f => f.id === editingId);
                    if (original?.imagenUrl) {
                        await CloudinaryApi.delete(original.imagenUrl, 'image');
                    }
                }
                const urlSubida = await CloudinaryApi.upload(selectedImage, 'ejercicios', 'Frases', 'image');
                finalImage = urlSubida;
            }

            if (editingId === -1) {
                // Crear nueva
                const nueva = await FrasesApi.create({ texto: editForm.texto, imagenUrl: finalImage });
                setFrases(prev => [...prev, nueva]);
            } else if (editingId) {
                // Actualizar existente
                const actualizada = await FrasesApi.update(editingId, { texto: editForm.texto, imagenUrl: finalImage });
                setFrases(prev => prev.map(f => (f.id === editingId ? actualizada : f)));
            }

            cancelEdit();
        } catch (err: any) {
            showError(err.response?.data?.error || "Error al guardar frase");
        } finally {
            setUploading(false);
        }
    };

    const handleEditInputChange = (field: keyof FraseMotivacionDTO, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setSelectedImage(e.target.files[0]);
    };

    return {
        frases, loading, uploading, isAdmin,
        editingId, editForm, 
        selectedImage,
        imageUrl, setImageUrl,
        handleDelete, startEdit, cancelEdit, saveEdit, handleEditInputChange, handleImageChange,
        refetch: fetchFrases
    };
};
