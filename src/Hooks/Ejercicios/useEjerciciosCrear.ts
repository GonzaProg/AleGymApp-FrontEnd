import { useState } from 'react';
import { EjerciciosApi, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; 
import { useAuthUser } from '../useAuthUser';
import { showSuccess, showError } from "../../Helpers/Alerts";

// Constantes fuera del hook para no recrearlas en cada render
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 
const API_URL_CLOUDINARY = "https://api.cloudinary.com/v1_1";

export const useEjerciciosCrear = () => {
    const { isAdmin, isEntrenador } = useAuthUser();

    // Estado inicial constante para poder resetear fácil
    const initialState: EjercicioDTO = { nombre: '', urlVideo: '', imagenUrl: '' };
    const [form, setForm] = useState<EjercicioDTO>(initialState);
    
    const [loading, setLoading] = useState(false);
    
    // Archivos
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'video') setSelectedVideo(e.target.files[0]);
            else setSelectedImage(e.target.files[0]);
        }
    };

    // Función auxiliar pura para subida (fuera del scope del render si es posible, o mantenida aquí por simplicidad)
    const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image'): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await fetch(`${API_URL_CLOUDINARY}/${CLOUD_NAME}/${resourceType}/upload`, { 
                method: 'POST', 
                body: formData 
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || `Error subiendo ${resourceType}`);
            return data.secure_url;
        } catch (error) {
            console.error(`Error Cloudinary (${resourceType}):`, error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
        e.preventDefault();
        
        // Validación temprana
        if (!isAdmin && !isEntrenador) {
            showError("No tienes permisos para realizar esta acción.");
            return false;
        }
        if (!form.nombre.trim()) {
            showError("El nombre del ejercicio es obligatorio.");
            return false;
        }

        setLoading(true);

        try {
            let finalVideoUrl = "";
            let finalImageUrl = "";

            // Array de promesas para subida paralela (Optimización de tiempo)
            const uploadPromises: Promise<void>[] = [];

            if (selectedVideo) {
                uploadPromises.push(uploadToCloudinary(selectedVideo, 'video').then(url => { finalVideoUrl = url; }));
            }
            if (selectedImage) {
                uploadPromises.push(uploadToCloudinary(selectedImage, 'image').then(url => { finalImageUrl = url; }));
            }

            // Esperamos a que todo se suba
            await Promise.all(uploadPromises);

            const ejercicioData: EjercicioDTO = {
                nombre: form.nombre,
                urlVideo: finalVideoUrl,
                imagenUrl: finalImageUrl
            };

            await EjerciciosApi.create(ejercicioData);
            
            await showSuccess("Ejercicio creado correctamente.");
            
            // Limpieza de formulario
            setForm(initialState);
            setSelectedVideo(null);
            setSelectedImage(null);
            
            return true; // Retornamos true para indicar éxito al componente

        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || "Error al crear el ejercicio";
            showError(errorMsg);
            return false; // Retornamos false en caso de error
        } finally {
            setLoading(false);
        }
    };

    return {
        form, 
        loading,
        selectedVideo, 
        selectedImage,
        handleInputChange,
        // Unificamos handlers o exponemos wrappers simples
        handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'video'),
        handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'image'),
        handleSubmit
    };
};