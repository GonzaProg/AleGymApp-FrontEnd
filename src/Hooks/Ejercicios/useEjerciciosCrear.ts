import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EjerciciosApi, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; 
import { useAuthUser } from '../useAuthUser';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

export const useEjerciciosCrear = () => {
    const navigate = useNavigate();
    const { isAdmin, isEntrenador } = useAuthUser();

    const [form, setForm] = useState<EjercicioDTO>({ nombre: '', urlVideo: '', imagenUrl: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estados separados para archivos
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Manejar selección de Video
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedVideo(e.target.files[0]);
    };

    // Manejar selección de Imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
    };

    // Función Genérica para subir a Cloudinary (Video o Imagen)
    const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image'): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, 
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(`Error al subir ${resourceType}`);
            return data.secure_url;
        } catch (error) {
            console.error(`Cloudinary ${resourceType} Error:`, error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin && !isEntrenador) return alert("No tienes permisos.");

        setLoading(true);
        setError(null);

        try {
            let finalVideoUrl = "";
            let finalImageUrl = "";

            // Subimos en paralelo si ambos existen
            const uploads = [];
            if (selectedVideo) uploads.push(uploadToCloudinary(selectedVideo, 'video').then(url => finalVideoUrl = url));
            if (selectedImage) uploads.push(uploadToCloudinary(selectedImage, 'image').then(url => finalImageUrl = url));
            
            await Promise.all(uploads);

            const ejercicioData: EjercicioDTO = {
                nombre: form.nombre,
                urlVideo: finalVideoUrl,
                imagenUrl: finalImageUrl
            };

            await EjerciciosApi.create(ejercicioData);
            navigate('/ejercicios/gestion'); 

        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Error al crear");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate(-1);

    return {
        form, loading, error,
        selectedVideo, selectedImage,
        isAdmin, isEntrenador, 
        handleInputChange,
        handleVideoChange,
        handleImageChange,
        handleSubmit,
        handleCancel
    };
};