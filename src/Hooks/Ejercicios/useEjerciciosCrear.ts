import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EjerciciosApi, type EjercicioDTO } from '../../API/Ejercicios/EjerciciosApi'; 
import { useAuthUser } from '../useAuthUser';

// CONSTANTES CLOUDINARY
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; 

export const useEjerciciosCrear = () => {
    const navigate = useNavigate();
    const { isAdmin, isEntrenador } = useAuthUser();

    // Estados
    const [form, setForm] = useState<EjercicioDTO>({ nombre: '', urlVideo: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // NUEVO: Estado para el archivo seleccionado
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Manejar inputs de texto (Nombre)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // NUEVO: Manejar selección de archivo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // NUEVO: Subir a Cloudinary (Video)
    const uploadVideoToCloudinary = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        try {
            // Endpoint de VIDEO
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, 
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            if (!res.ok) throw new Error("Error al subir video a la nube");
            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary Error:", error);
            throw error;
        }
    };

    // Enviar Formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAdmin && !isEntrenador) {
            alert("No tienes permisos para crear ejercicios.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let finalUrl = "";

            // 1. Si hay archivo, lo subimos primero
            if (selectedFile) {
                finalUrl = await uploadVideoToCloudinary(selectedFile);
            }

            // 2. Creamos el DTO final
            const ejercicioData: EjercicioDTO = {
                nombre: form.nombre,
                urlVideo: finalUrl // Enviamos la URL generada (o vacía si no hubo video)
            };

            // 3. Guardamos en backend
            await EjerciciosApi.create(ejercicioData);
            navigate('/ejercicios/gestion'); 

        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || "Error al crear";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return {
        form,
        loading,
        error,
        selectedFile, // Exportamos para mostrar nombre del archivo
        isAdmin,
        isEntrenador, 
        handleInputChange,
        handleFileChange, // Exportamos el nuevo handler
        handleSubmit,
        handleCancel
    };
};