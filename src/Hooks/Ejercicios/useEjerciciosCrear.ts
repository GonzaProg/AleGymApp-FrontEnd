import { useState } from 'react';
import { EjerciciosApi, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; 
import { useAuthUser } from '../Auth/useAuthUser';
import { showSuccess, showError } from "../../Helpers/Alerts";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

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
                uploadPromises.push(CloudinaryApi.upload(selectedVideo, 'video').then(url => { finalVideoUrl = url; }));
            }
            if (selectedImage) {
                uploadPromises.push(CloudinaryApi.upload(selectedImage, 'image').then(url => { finalImageUrl = url; }));
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