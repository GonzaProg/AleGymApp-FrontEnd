import { useState } from 'react';
import { EjerciciosApi, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; 
import { useAuthUser } from '../Auth/useAuthUser';
import { showSuccess, showError } from "../../Helpers/Alerts";
import { CloudinaryApi } from "../../Helpers/Cloudinary/Cloudinary";

export const useEjerciciosCrear = () => {
    const { isAdmin, isEntrenador } = useAuthUser();

    const initialState: EjercicioDTO = { nombre: '', urlVideo: '', imagenUrl: '' };
    const [form, setForm] = useState<EjercicioDTO>(initialState);
    const [loading, setLoading] = useState(false);
    
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
            // CORRECCIÓN AQUÍ: Priorizamos la lógica de Admin
            if (isAdmin) {
                // Lógica Admin: Sube archivos y crea completo
                let finalVideoUrl = "";
                let finalImageUrl = "";

                if (selectedVideo) {
                    finalVideoUrl = await CloudinaryApi.upload(selectedVideo, 'ejercicios', 'Ejercicios', 'video');
                }
                
                if (selectedImage) {
                    finalImageUrl = await CloudinaryApi.upload(selectedImage, 'ejercicios', 'Ejercicios', 'image');
                }

                const ejercicioData: EjercicioDTO = {
                    nombre: form.nombre,
                    urlVideo: finalVideoUrl || undefined,
                    imagenUrl: finalImageUrl || undefined
                };

                await EjerciciosApi.create(ejercicioData);
            } else {
                // Lógica Entrenador: Solo crea el nombre, ignora archivos si hubiese
                await EjerciciosApi.createBasic(form.nombre);
            }
            
            await showSuccess("Ejercicio creado correctamente.");
            
            setForm(initialState);
            setSelectedVideo(null);
            setSelectedImage(null);
            
            return true;

        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || "Error al crear el ejercicio";
            showError(errorMsg);
            return false;
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
        handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'video'),
        handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'image'),
        handleSubmit
    };
};